import { BillStatus, CourseType, PriceType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { calculateTax } from "@/lib/taxEngine";
import { getNextInvoiceNumber } from "@/lib/numbering";
import { generateBillPdf } from "@/lib/invoice";
import { sendBillEmail } from "@/lib/mail";

const COURSE_PRICES: Record<CourseType, number> = {
  ONLINE_3500: 3500,
  ONLINE_5000: 5000,
  ONLINE_15000: 15000,
  OFFLINE_45000: 45000,
};

const createBillSchema = z.object({
  courseName: z.string().trim().min(2).max(120),
  studentName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(20),
  customerAddress: z.string().trim().min(3).max(250),
  customerCity: z.string().trim().min(2).max(100),
  customerState: z.string().trim().min(2).max(100),
  customerPostalCode: z.string().trim().min(3).max(20),
  customerGstin: z.string().trim().optional(),
  placeOfSupply: z.string().trim().min(2).max(100),
  courseType: z.nativeEnum(CourseType),
  priceType: z.nativeEnum(PriceType).optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, bills });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to fetch bills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const parsed = createBillSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please provide valid bill and billing address details", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Fetch Company Tax Settings
    const settings = await prisma.taxSettings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.isConfigured) {
      return NextResponse.json(
        { message: "TAX CONFIGURATION INCOMPLETE. Please configure tax settings in dashboard before creating invoices." },
        { status: 400 }
      );
    }

    const coursePrice = COURSE_PRICES[data.courseType];
    const priceType = data.priceType || settings.defaultPriceType;
    const gstRate = Number(settings.gstRate);

    // 2. Perform Backend Tax Calculation
    const taxRes = calculateTax({
      coursePrice,
      priceType,
      gstRate,
      supplierState: settings.state,
      placeOfSupply: data.placeOfSupply,
    });

    // 3. Sequential Invoice Numbering inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const { invoiceNumber } = await getNextInvoiceNumber(tx);

      const bill = await tx.bill.create({
        data: {
          billNumber: invoiceNumber,
          courseName: data.courseName,
          studentName: data.studentName,
          email: data.email.toLowerCase(),
          phone: data.phone,
          customerAddress: data.customerAddress,
          customerCity: data.customerCity,
          customerState: data.customerState,
          customerPostalCode: data.customerPostalCode,
          customerGstin: data.customerGstin || null,
          placeOfSupply: data.placeOfSupply,
          courseType: data.courseType,
          amount: Math.round(taxRes.grandTotal), // for backward compatibility
          baseAmount: taxRes.baseAmount,
          discountAmount: taxRes.discountAmount,
          taxableAmount: taxRes.taxableAmount,
          taxRate: taxRes.taxRate,
          cgstRate: taxRes.cgstRate,
          cgstAmount: taxRes.cgstAmount,
          sgstRate: taxRes.sgstRate,
          sgstAmount: taxRes.sgstAmount,
          igstRate: taxRes.igstRate,
          igstAmount: taxRes.igstAmount,
          totalTax: taxRes.totalTax,
          grandTotal: taxRes.grandTotal,
          priceType,
          sacCode: settings.sacCode,
          invoiceDate: new Date(),
          status: BillStatus.CREATED,
          emailSent: false,
        },
      });

      return { bill, settings };
    });

    const { bill } = result;

    // 4. Generate PDF Invoice
    const pdf = await generateBillPdf({
      billNumber: bill.billNumber,
      invoiceDate: bill.invoiceDate,
      courseName: bill.courseName,
      courseType: bill.courseType,
      studentName: bill.studentName,
      email: bill.email,
      phone: bill.phone,
      customerAddress: bill.customerAddress,
      customerCity: bill.customerCity,
      customerState: bill.customerState,
      customerPostalCode: bill.customerPostalCode,
      customerGstin: bill.customerGstin,
      placeOfSupply: bill.placeOfSupply,
      baseAmount: Number(bill.baseAmount),
      discountAmount: Number(bill.discountAmount),
      taxableAmount: Number(bill.taxableAmount),
      taxRate: Number(bill.taxRate),
      cgstRate: Number(bill.cgstRate),
      cgstAmount: Number(bill.cgstAmount),
      sgstRate: Number(bill.sgstRate),
      sgstAmount: Number(bill.sgstAmount),
      igstRate: Number(bill.igstRate),
      igstAmount: Number(bill.igstAmount),
      totalTax: Number(bill.totalTax),
      grandTotal: Number(bill.grandTotal),
      priceType: bill.priceType,
      sacCode: bill.sacCode,
      companySettings: settings,
    });

    let emailSent = false;

    // 5. Send Email
    try {
      await sendBillEmail({
        email: bill.email,
        studentName: bill.studentName,
        courseName: bill.courseName,
        billNumber: bill.billNumber,
        invoiceDate: bill.invoiceDate,
        grandTotal: Number(bill.grandTotal),
        pdf,
      });
      emailSent = true;
      await prisma.bill.update({
        where: { id: bill.id },
        data: { emailSent: true, status: BillStatus.SENT },
      });
    } catch (emailError) {
      console.error("Email delivery failed:", emailError);
      await prisma.bill.update({
        where: { id: bill.id },
        data: { status: BillStatus.EMAIL_FAILED },
      });
    }

    return NextResponse.json({
      success: true,
      emailSent,
      bill: {
        id: bill.id,
        billNumber: bill.billNumber,
        grandTotal: Number(bill.grandTotal),
        status: emailSent ? BillStatus.SENT : BillStatus.EMAIL_FAILED,
      },
    });
  } catch (error) {
    console.error("Create bill error:", error);
    return NextResponse.json({ message: "Unable to create invoice" }, { status: 500 });
  }
}
