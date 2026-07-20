"use client";

import { FormEvent, useEffect, useState } from "react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

const courseOptions = [
  { value: "ONLINE_3500", label: "Online Course - ₹3,500" },
  { value: "ONLINE_5000", label: "Online Course - ₹5,000" },
  { value: "ONLINE_15000", label: "Online Course - ₹15,000" },
  { value: "OFFLINE_45000", label: "Offline Course - ₹45,000" },
];

export default function CreateBillPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [courseName, setCourseName] = useState("");
  const [courseType, setCourseType] = useState("ONLINE_3500");
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("Telangana");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("Telangana");
  const [priceType, setPriceType] = useState("TAX_INCLUSIVE");

  // Preview Calculation State
  const [previewData, setPreviewData] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch settings to set default place of supply & price type
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setIsConfigured(Boolean(data.settings.isConfigured));
          if (data.settings.state) {
            setCustomerState(data.settings.state);
            setPlaceOfSupply(data.settings.state);
          }
          if (data.settings.defaultPriceType) {
            setPriceType(data.settings.defaultPriceType);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Recalculate preview whenever pricing factors change
  useEffect(() => {
    if (!courseType || !placeOfSupply) return;

    fetch("/api/bills/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseType, placeOfSupply, priceType }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsConfigured(true);
          setPreviewData(data.calculation);
        } else if (data.isConfigured === false) {
          setIsConfigured(false);
          setPreviewData(null);
        }
      })
      .catch((err) => console.error(err));
  }, [courseType, placeOfSupply, priceType]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    const payload = {
      courseName,
      courseType,
      studentName,
      email,
      phone,
      customerAddress,
      customerCity,
      customerState,
      customerPostalCode,
      customerGstin: customerGstin || undefined,
      placeOfSupply,
      priceType,
    };

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create invoice");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setMessage(
        `Invoice ${data.bill.billNumber} created successfully! ` +
          (data.emailSent
            ? "PDF invoice was emailed to the student."
            : "Invoice was saved, but email sending failed. You can resend it later from the Dashboard.")
      );

      // Reset form
      setCourseName("");
      setStudentName("");
      setEmail("");
      setPhone("");
      setCustomerAddress("");
      setCustomerCity("");
      setCustomerPostalCode("");
      setCustomerGstin("");
    } catch (err) {
      console.error(err);
      setMessage("An unexpected error occurred while creating the invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="mt-2 text-slate-500">
          Generate an official GST Tax Invoice and email the PDF directly to the student.
        </p>
      </div>

      {!isConfigured && (
        <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-800 flex items-center justify-between">
          <div>
            <p className="font-bold text-amber-900">TAX CONFIGURATION INCOMPLETE</p>
            <p className="text-sm mt-1">
              Please complete company tax registration and state settings before issuing GST invoices.
            </p>
          </div>
          <a
            href="/dashboard/settings"
            className="rounded-lg bg-amber-900 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800"
          >
            Configure Tax
          </a>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          {/* COURSE DETAILS */}
          <div className="rounded-2xl border bg-white p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3 uppercase tracking-wider text-xs text-slate-500">
              1. Course Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700">Course Name</label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Example: Full Stack Web Development"
                className="mt-2 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Course Type / Fee</label>
              <select
                required
                value={courseType}
                onChange={(e) => setCourseType(e.target.value)}
                className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              >
                {courseOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STUDENT / BILL TO DETAILS */}
          <div className="rounded-2xl border bg-white p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3 uppercase tracking-wider text-xs text-slate-500">
              2. Student / Bill To Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700">Student Full Name</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="John Doe"
                className="mt-2 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="mt-2 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-2 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Billing Address</label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="House / Flat No., Street, Landmark"
                className="mt-2 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input
                  type="text"
                  required
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Hyderabad"
                  className="mt-2 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">State</label>
                <select
                  value={customerState}
                  onChange={(e) => {
                    setCustomerState(e.target.value);
                    setPlaceOfSupply(e.target.value);
                  }}
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Postal Code</label>
                <input
                  type="text"
                  required
                  value={customerPostalCode}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  placeholder="500081"
                  className="mt-2 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Customer GSTIN (Optional)</label>
              <input
                type="text"
                maxLength={15}
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                placeholder="36AAAAA0000A1Z5"
                className="mt-2 w-full rounded-lg border px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          {/* TAX DETAILS */}
          <div className="rounded-2xl border bg-white p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-3 uppercase tracking-wider text-xs text-slate-500">
              3. Tax Details
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Place of Supply</label>
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Price Type</label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  <option value="TAX_INCLUSIVE">Tax Inclusive</option>
                  <option value="TAX_EXCLUSIVE">Tax Exclusive</option>
                </select>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-xl p-4 text-sm font-medium border ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              PREVIEW INVOICE
            </button>
            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="rounded-xl bg-slate-900 px-8 py-3.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition flex-1"
            >
              {loading ? "Creating & Emailing..." : "CREATE & EMAIL INVOICE"}
            </button>
          </div>
        </form>

        {/* Live Summary Column */}
        <div>
          <div className="sticky top-8 rounded-2xl border bg-white p-6 space-y-6">
            <h3 className="font-bold text-slate-900 text-lg border-b pb-3">Live Invoice Summary</h3>

            {previewData ? (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Course Price</span>
                  <span className="font-semibold text-slate-900">₹{previewData.baseAmount.toLocaleString("en-IN")}</span>
                </div>

                {previewData.discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Discount</span>
                    <span className="font-semibold text-emerald-600">-₹{previewData.discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 text-slate-600 border-t pt-3">
                  <span>Taxable Value</span>
                  <span className="font-semibold text-slate-900">₹{previewData.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>

                {previewData.isIntraState ? (
                  <>
                    <div className="flex justify-between py-1 text-slate-500 pl-3">
                      <span>CGST ({previewData.cgstRate}%)</span>
                      <span>₹{previewData.cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-500 pl-3">
                      <span>SGST ({previewData.sgstRate}%)</span>
                      <span>₹{previewData.sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-1 text-slate-500 pl-3">
                    <span>IGST ({previewData.igstRate}%)</span>
                    <span>₹{previewData.igstAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 text-slate-700 border-t font-medium">
                  <span>Total Tax</span>
                  <span>₹{previewData.totalTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-3 border-t border-b text-base font-bold text-slate-900 bg-slate-50 px-3 rounded-lg">
                  <span>Grand Total</span>
                  <span className="text-blue-700">₹{previewData.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>

                <p className="text-xs text-slate-400 text-center pt-2">
                  Tax breakdown calculated automatically based on Place of Supply:{" "}
                  <strong className="text-slate-600">{placeOfSupply}</strong>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Calculating summary...</p>
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-w-2xl w-full rounded-2xl bg-white p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-slate-900">Invoice Preview</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500">Student Name</p>
                  <p className="font-semibold text-slate-900">{studentName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email & Phone</p>
                  <p className="font-semibold text-slate-900">{email || "N/A"} | {phone || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Billing Address</p>
                  <p className="font-medium text-slate-800">
                    {[customerAddress, customerCity, customerState, customerPostalCode].filter(Boolean).join(", ") || "N/A"}
                  </p>
                </div>
              </div>

              <div className="border rounded-xl p-4 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Course</span>
                  <span>{courseName || "Course"} ({courseType})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Price Type</span>
                  <span>{priceType}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Place of Supply</span>
                  <span>{placeOfSupply}</span>
                </div>
              </div>

              {previewData && (
                <div className="border rounded-xl p-4 bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Taxable Amount</span>
                    <span>₹{previewData.taxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Tax ({previewData.taxRate}%)</span>
                    <span>₹{previewData.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-slate-700 pt-2">
                    <span>Grand Total</span>
                    <span className="text-emerald-400">₹{previewData.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
