import { PriceType } from "@prisma/client";

export type TaxCalculationInput = {
  coursePrice: number;
  discount?: number;
  priceType: PriceType;
  gstRate: number; // e.g. 18.0
  supplierState: string;
  placeOfSupply: string;
};

export type TaxCalculationResult = {
  baseAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  isIntraState: boolean;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
};

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const coursePrice = Math.max(0, input.coursePrice);
  const discountAmount = Math.max(0, input.discount || 0);
  const rate = Math.max(0, input.gstRate);

  const netPrice = Math.max(0, coursePrice - discountAmount);

  let taxableAmount = 0;
  let totalTax = 0;
  let grandTotal = 0;

  if (input.priceType === PriceType.TAX_INCLUSIVE) {
    if (rate === 0) {
      taxableAmount = netPrice;
      totalTax = 0;
      grandTotal = netPrice;
    } else {
      taxableAmount = round2(netPrice / (1 + rate / 100));
      totalTax = round2(netPrice - taxableAmount);
      grandTotal = netPrice;
    }
  } else {
    // TAX_EXCLUSIVE
    taxableAmount = netPrice;
    totalTax = round2(taxableAmount * (rate / 100));
    grandTotal = round2(taxableAmount + totalTax);
  }

  const normSupplier = (input.supplierState || "").trim().toLowerCase();
  const normSupply = (input.placeOfSupply || "").trim().toLowerCase();
  const isIntraState = normSupplier !== "" && normSupply !== "" && normSupplier === normSupply;

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isIntraState) {
    cgstRate = round2(rate / 2);
    sgstRate = round2(rate / 2);
    cgstAmount = round2(totalTax / 2);
    sgstAmount = round2(totalTax - cgstAmount);
  } else {
    igstRate = rate;
    igstAmount = totalTax;
  }

  return {
    baseAmount: coursePrice,
    discountAmount,
    taxableAmount,
    taxRate: rate,
    isIntraState,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTax,
    grandTotal,
  };
}
