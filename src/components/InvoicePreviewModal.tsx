"use client";

import React from "react";

type InvoicePreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  data: {
    studentName: string;
    email: string;
    phone: string;
    customerAddress: string;
    customerCity: string;
    customerState: string;
    customerPostalCode: string;
    customerGstin?: string;
    courseName: string;
    courseType: string;
    placeOfSupply: string;
    priceType: string;
    calculation?: {
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
  };
};

export default function InvoicePreviewModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  data,
}: InvoicePreviewModalProps) {
  if (!isOpen) return null;

  const calc = data.calculation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              Draft Preview
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-1">Review Tax Invoice</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Student & Course Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2 bg-orange-50/40 p-4 rounded-2xl border border-orange-100/60 text-xs">
          <div>
            <p className="text-gray-500 font-medium">STUDENT NAME</p>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{data.studentName || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">CONTACT DETAILS</p>
            <p className="font-medium text-gray-900 mt-0.5">{data.email || "N/A"}</p>
            <p className="text-gray-600">{data.phone}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500 font-medium">BILLING ADDRESS</p>
            <p className="font-medium text-gray-900 mt-0.5">
              {[data.customerAddress, data.customerCity, data.customerState, data.customerPostalCode].filter(Boolean).join(", ") || "N/A"}
            </p>
            {data.customerGstin && (
              <p className="text-orange-700 font-mono mt-1">GSTIN: {data.customerGstin}</p>
            )}
          </div>
        </div>

        {/* Course & Tax Setting Info */}
        <div className="border border-gray-100 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 font-semibold">
            <span className="text-gray-500">Course Name</span>
            <span className="text-gray-900 text-sm font-bold">{data.courseName || "Web Development"}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Course Fee Option</span>
            <span className="font-medium">{data.courseType}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Place of Supply</span>
            <span className="font-medium">{data.placeOfSupply}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Pricing Type</span>
            <span className="font-medium">{data.priceType === "TAX_INCLUSIVE" ? "Tax Inclusive" : "Tax Exclusive"}</span>
          </div>
        </div>

        {/* Calculated Financial Breakdown */}
        {calc ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Base Course Price</span>
              <span className="font-medium text-gray-900">₹{calc.baseAmount.toLocaleString("en-IN")}</span>
            </div>

            {calc.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">-₹{calc.discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2 font-medium">
              <span>Taxable Value</span>
              <span className="text-gray-900">₹{calc.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            {calc.isIntraState ? (
              <>
                <div className="flex justify-between text-gray-500 pl-3">
                  <span>CGST ({calc.cgstRate}%)</span>
                  <span>₹{calc.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 pl-3">
                  <span>SGST ({calc.sgstRate}%)</span>
                  <span>₹{calc.sgstAmount.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-gray-500 pl-3">
                <span>IGST ({calc.igstRate}%)</span>
                <span>₹{calc.igstAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-700 font-semibold border-t border-gray-200 pt-2">
              <span>Total Tax Amount</span>
              <span>₹{calc.totalTax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-base font-bold bg-white p-3.5 rounded-xl border border-orange-200 text-gray-900 shadow-xs">
              <span>Grand Total</span>
              <span className="text-orange-600 text-lg">₹{calc.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic text-center">Calculating preview breakdown...</p>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 rounded-xl border border-gray-300 bg-white py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back & Edit Details
          </button>
          <button
            type="button"
            disabled={loading || !calc}
            onClick={onConfirm}
            className="w-full sm:w-1/2 rounded-xl bg-orange-500 py-3 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Creating & Emailing..." : "Confirm & Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
