import { Request, Response } from "express";
import { BillStatus, CourseType, PriceType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { calculateTax } from "../lib/taxEngine";
import { getNextInvoiceNumber } from "../lib/numbering";
import { generateBillPdf } from "../lib/invoice";
import { sendBillEmail } from "../lib/mail";

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

const previewSchema = z.object({
  courseType: z.nativeEnum(CourseType),
  placeOfSupply: z.string().trim().min(2),
  priceType: z.nativeEnum(PriceType).optional(),
});

export async function previewBill(req: Request, res: Response) {
  try {
    const parsed = previewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid preview inputs", errors: parsed.error.flatten() });
    }

    const { courseType, placeOfSupply, priceType } = parsed.data;
    const coursePrice = COURSE_PRICES[courseType];

    const settings = await prisma.taxSettings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.isConfigured) {
      return res.json({
        success: false,
        isConfigured: false,
        message: "TAX CONFIGURATION INCOMPLETE",
      });
    }

    const activePriceType = priceType || settings.defaultPriceType;
    const gstRate = Number(settings.gstRate);

    const calculation = calculateTax({
      coursePrice,
      priceType: activePriceType,
      gstRate,
      supplierState: settings.state,
      placeOfSupply,
    });

    return res.json({
      success: true,
      isConfigured: true,
      settings: {
        companyName: settings.companyName,
        tradeName: settings.tradeName,
        supplierState: settings.state,
        sacCode: settings.sacCode,
      },
      calculation,
    });
  } catch (error) {
    console.error("Preview error:", error);
    return res.status(500).json({ message: "Unable to calculate invoice preview" });
  }
}

export async function getBills(req: Request, res: Response) {
  try {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, bills });
  } catch (error) {
    console.error("Get bills error:", error);
    return res.status(500).json({ message: "Unable to fetch bills" });
  }
}

export async function createBill(req: Request, res: Response) {
  try {
    const parsed = createBillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Please provide valid bill and billing address details",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    const settings = await prisma.taxSettings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.isConfigured) {
      return res.status(400).json({
        message: "TAX CONFIGURATION INCOMPLETE. Please configure tax settings in dashboard before creating invoices.",
      });
    }

    const coursePrice = COURSE_PRICES[data.courseType];
    const priceType = data.priceType || settings.defaultPriceType;
    const gstRate = Number(settings.gstRate);

    const taxRes = calculateTax({
      coursePrice,
      priceType,
      gstRate,
      supplierState: settings.state,
      placeOfSupply: data.placeOfSupply,
    });

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
          amount: Math.round(taxRes.grandTotal),
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

    return res.json({
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
    return res.status(500).json({ message: "Unable to create invoice" });
  }
}

export async function getBillPdf(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) {
      return res.status(404).json({ message: "Invoice not found" });
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

    const safeFilename = `${bill.billNumber.replace(/[\/\\]/g, "_")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename}"`);
    return res.send(pdf);
  } catch (error) {
    console.error("Generate PDF error:", error);
    return res.status(500).json({ message: "Unable to generate PDF" });
  }
}

export async function resendBillEmail(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) {
      return res.status(404).json({ message: "Invoice not found" });
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

      return res.json({ success: true, message: "Email resent successfully" });
    } catch (emailError) {
      console.error("Resend email failed:", emailError);
      await prisma.bill.update({
        where: { id: bill.id },
        data: { status: BillStatus.EMAIL_FAILED },
      });
      return res.status(500).json({ message: "Email delivery failed. Check SMTP settings." });
    }
  } catch (error) {
    console.error("Resend email error:", error);
    return res.status(500).json({ message: "Unable to resend email" });
  }
}
