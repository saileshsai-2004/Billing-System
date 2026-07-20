import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { generateBillPdf } from "@/lib/invoice";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const safeFilename = `${bill.billNumber.replace(/[\/\\]/g, "_")}.pdf`;

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFilename}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to generate PDF" }, { status: 500 });
  }
}
