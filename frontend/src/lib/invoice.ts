import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { numberToWords } from "./numberToWords";

export type BillPdfData = {
  billNumber: string;
  invoiceDate: Date;
  courseName: string;
  courseType: string;
  studentName: string;
  email: string;
  phone: string;
  customerAddress?: string | null;
  customerCity?: string | null;
  customerState?: string | null;
  customerPostalCode?: string | null;
  customerGstin?: string | null;
  placeOfSupply?: string | null;
  baseAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  priceType: string;
  sacCode?: string | null;
  companySettings?: {
    companyName: string;
    tradeName: string;
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    gstin: string;
    email: string;
    phone: string;
    website?: string | null;
  } | null;
};

function formatCurrency(num: number): string {
  return `INR ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function courseTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ONLINE_3500: "Online Course (INR 3,500)",
    ONLINE_5000: "Online Course (INR 5,000)",
    ONLINE_15000: "Online Course (INR 15,000)",
    OFFLINE_45000: "Offline Course (INR 45,000)",
  };
  return labels[type] || type;
}

export async function generateBillPdf(data: BillPdfData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = rgb(0.08, 0.12, 0.24); // Dark Slate Blue
  const secondaryColor = rgb(0.35, 0.4, 0.5);
  const borderColor = rgb(0.85, 0.88, 0.92);
  const lightBg = rgb(0.96, 0.97, 0.99);

  const margin = 40;
  const contentWidth = 595.28 - margin * 2; // 515.28

  const comp = data.companySettings || {
    companyName: "ADYAPAN EDUTECH PVT. LTD.",
    tradeName: "ADYAPAN",
    address: "Plot No. 12, Tech Park Avenue, Hitech City",
    city: "Hyderabad",
    state: "Telangana",
    stateCode: "36",
    postalCode: "500081",
    gstin: "36AAAAA0000A1Z5",
    email: "billing@adyapan.com",
    phone: "+91 98765 43210",
    website: "www.adyapan.com",
  };

  let currentY = 800;

  // Header Logo / Trade Name
  page.drawText(comp.tradeName.toUpperCase(), {
    x: margin,
    y: currentY,
    size: 22,
    font: bold,
    color: primaryColor,
  });

  page.drawText("TAX INVOICE", {
    x: margin + contentWidth - 110,
    y: currentY,
    size: 16,
    font: bold,
    color: primaryColor,
  });

  currentY -= 16;
  page.drawText(comp.companyName, {
    x: margin,
    y: currentY,
    size: 10,
    font: bold,
    color: secondaryColor,
  });

  currentY -= 14;
  const companyAddrLine = [comp.address, comp.city, comp.state, comp.postalCode].filter(Boolean).join(", ");
  page.drawText(companyAddrLine, {
    x: margin,
    y: currentY,
    size: 9,
    font: regular,
    color: secondaryColor,
  });

  currentY -= 13;
  const companyContactLine = `GSTIN: ${comp.gstin || "N/A"} | Email: ${comp.email} | Phone: ${comp.phone}`;
  page.drawText(companyContactLine, {
    x: margin,
    y: currentY,
    size: 9,
    font: regular,
    color: secondaryColor,
  });

  currentY -= 18;
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: margin + contentWidth, y: currentY },
    thickness: 1,
    color: primaryColor,
  });

  currentY -= 15;

  // Invoice & Customer Info Box
  const boxHeight = 70;
  page.drawRectangle({
    x: margin,
    y: currentY - boxHeight,
    width: contentWidth,
    height: boxHeight,
    color: lightBg,
    borderColor,
    borderWidth: 1,
  });

  const colHalf = contentWidth / 2;

  // Left side: Invoice details
  const invDateStr = data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
  page.drawText(`Invoice No: ${data.billNumber}`, { x: margin + 12, y: currentY - 20, size: 9, font: bold });
  page.drawText(`Invoice Date: ${invDateStr}`, { x: margin + 12, y: currentY - 35, size: 9, font: regular });
  page.drawText(`Place of Supply: ${data.placeOfSupply || comp.state || "N/A"}`, { x: margin + 12, y: currentY - 50, size: 9, font: regular });

  // Right side: State code & Tax mode
  page.drawText(`State Code: ${comp.stateCode || "36"}`, { x: margin + colHalf + 12, y: currentY - 20, size: 9, font: regular });
  page.drawText(`Price Type: ${data.priceType === "TAX_INCLUSIVE" ? "Tax Inclusive" : "Tax Exclusive"}`, { x: margin + colHalf + 12, y: currentY - 35, size: 9, font: regular });
  page.drawText(`SAC Code: ${data.sacCode || "999293"}`, { x: margin + colHalf + 12, y: currentY - 50, size: 9, font: regular });

  currentY -= boxHeight + 20;

  // BILL TO Section
  page.drawText("BILL TO", { x: margin, y: currentY, size: 10, font: bold, color: primaryColor });
  currentY -= 14;

  const addrLine = [data.customerAddress, data.customerCity, data.customerState, data.customerPostalCode].filter(Boolean).join(", ");
  page.drawText(`Student Name: ${data.studentName}`, { x: margin, y: currentY, size: 9, font: bold });
  currentY -= 13;
  if (addrLine) {
    page.drawText(`Address: ${addrLine}`, { x: margin, y: currentY, size: 9, font: regular });
    currentY -= 13;
  }
  page.drawText(`Email: ${data.email} | Phone: ${data.phone}`, { x: margin, y: currentY, size: 9, font: regular });
  currentY -= 13;
  if (data.customerGstin) {
    page.drawText(`Customer GSTIN: ${data.customerGstin}`, { x: margin, y: currentY, size: 9, font: regular });
    currentY -= 13;
  }

  currentY -= 15;

  // Item Table Header
  const tableHeaderY = currentY;
  const tableHeaderHeight = 22;
  page.drawRectangle({
    x: margin,
    y: tableHeaderY - tableHeaderHeight,
    width: contentWidth,
    height: tableHeaderHeight,
    color: primaryColor,
  });

  const colSno = margin + 8;
  const colDesc = margin + 35;
  const colSac = margin + 260;
  const colQty = margin + 330;
  const colRate = margin + 380;
  const colTaxable = margin + 440;

  page.drawText("#", { x: colSno, y: tableHeaderY - 15, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("DESCRIPTION", { x: colDesc, y: tableHeaderY - 15, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("SAC", { x: colSac, y: tableHeaderY - 15, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("QTY", { x: colQty, y: tableHeaderY - 15, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("RATE", { x: colRate, y: tableHeaderY - 15, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("TAXABLE VAL", { x: colTaxable, y: tableHeaderY - 15, size: 9, font: bold, color: rgb(1, 1, 1) });

  currentY = tableHeaderY - tableHeaderHeight;

  // Row 1
  const rowHeight = 35;
  page.drawRectangle({
    x: margin,
    y: currentY - rowHeight,
    width: contentWidth,
    height: rowHeight,
    borderColor,
    borderWidth: 1,
  });

  page.drawText("1", { x: colSno, y: currentY - 16, size: 9, font: regular });
  page.drawText(data.courseName, { x: colDesc, y: currentY - 14, size: 9, font: bold });
  page.drawText(courseTypeLabel(data.courseType), { x: colDesc, y: currentY - 26, size: 8, font: regular, color: secondaryColor });
  page.drawText(data.sacCode || "999293", { x: colSac, y: currentY - 16, size: 9, font: regular });
  page.drawText("1", { x: colQty, y: currentY - 16, size: 9, font: regular });
  page.drawText(data.taxableAmount.toFixed(2), { x: colRate, y: currentY - 16, size: 9, font: regular });
  page.drawText(data.taxableAmount.toFixed(2), { x: colTaxable, y: currentY - 16, size: 9, font: bold });

  currentY -= rowHeight + 15;

  // Breakdown Table (Right Aligned)
  const breakdownWidth = 240;
  const breakdownX = margin + contentWidth - breakdownWidth;

  const rows: { label: string; val: string; isBold?: boolean }[] = [
    { label: "Base Amount:", val: data.baseAmount.toFixed(2) },
  ];

  if (data.discountAmount > 0) {
    rows.push({ label: "Discount:", val: `-${data.discountAmount.toFixed(2)}` });
  }

  rows.push({ label: "Taxable Value:", val: data.taxableAmount.toFixed(2) });

  if (data.cgstAmount > 0 || data.sgstAmount > 0) {
    rows.push({ label: `CGST @ ${data.cgstRate}%:`, val: data.cgstAmount.toFixed(2) });
    rows.push({ label: `SGST @ ${data.sgstRate}%:`, val: data.sgstAmount.toFixed(2) });
  } else if (data.igstAmount > 0) {
    rows.push({ label: `IGST @ ${data.igstRate}%:`, val: data.igstAmount.toFixed(2) });
  }

  rows.push({ label: "Total Tax:", val: data.totalTax.toFixed(2) });
  rows.push({ label: "GRAND TOTAL:", val: formatCurrency(data.grandTotal), isBold: true });

  for (const row of rows) {
    if (row.isBold) {
      page.drawRectangle({
        x: breakdownX - 10,
        y: currentY - 4,
        width: breakdownWidth + 10,
        height: 20,
        color: lightBg,
        borderColor,
        borderWidth: 1,
      });
      page.drawText(row.label, { x: breakdownX, y: currentY, size: 10, font: bold, color: primaryColor });
      page.drawText(row.val, { x: breakdownX + 120, y: currentY, size: 10, font: bold, color: primaryColor });
    } else {
      page.drawText(row.label, { x: breakdownX, y: currentY, size: 9, font: regular, color: secondaryColor });
      page.drawText(row.val, { x: breakdownX + 120, y: currentY, size: 9, font: regular });
    }
    currentY -= 18;
  }

  currentY -= 15;

  // Amount in Words
  page.drawRectangle({
    x: margin,
    y: currentY - 24,
    width: contentWidth,
    height: 24,
    color: lightBg,
    borderColor,
    borderWidth: 1,
  });

  const words = numberToWords(data.grandTotal);
  page.drawText(`Amount in Words: ${words}`, {
    x: margin + 8,
    y: currentY - 16,
    size: 9,
    font: bold,
    color: primaryColor,
  });

  currentY -= 50;

  // Footer / Signatory Block
  page.drawText("Terms & Declarations:", { x: margin, y: currentY, size: 9, font: bold });
  currentY -= 13;
  page.drawText("1. Payment is non-refundable once course access is granted.", { x: margin, y: currentY, size: 8, font: regular, color: secondaryColor });
  currentY -= 12;
  page.drawText("2. This is a computer-generated tax invoice and requires no physical signature.", { x: margin, y: currentY, size: 8, font: regular, color: secondaryColor });

  // Authorized Signatory
  const sigX = margin + contentWidth - 160;
  page.drawText(`For ${comp.companyName}`, { x: sigX, y: currentY + 25, size: 9, font: bold, color: primaryColor });
  page.drawText("Authorized Signatory", { x: sigX, y: currentY - 10, size: 9, font: regular, color: secondaryColor });

  return Buffer.from(await pdfDoc.save());
}
