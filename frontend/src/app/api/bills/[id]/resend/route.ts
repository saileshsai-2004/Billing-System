import { BillStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { generateBillPdf } from "@/lib/invoice";
import { sendBillEmail } from "@/lib/mail";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    const settings = await prisma.taxSettings.findUnique({ where: { id: "default" } });

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

      await prisma.bill.update({
        where: { id: bill.id },
        data: { emailSent: true, status: BillStatus.SENT },
      });

      return NextResponse.json({ success: true, message: "Email resent successfully" });
    } catch (emailError) {
      console.error("Resend email failed:", emailError);
      await prisma.bill.update({
        where: { id: bill.id },
        data: { status: BillStatus.EMAIL_FAILED },
      });
      return NextResponse.json({ message: "Email delivery failed. Check SMTP settings." }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to resend email" }, { status: 500 });
  }
}
