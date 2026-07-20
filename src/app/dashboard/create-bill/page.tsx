"use client";

import { FormEvent, useEffect, useState } from "react";
import InvoicePreviewModal from "@/components/InvoicePreviewModal";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

const courseOptions = [
  { value: "ONLINE_3500", label: "Online Course", price: "₹3,500" },
  { value: "ONLINE_5000", label: "Online Course", price: "₹5,000" },
  { value: "ONLINE_15000", label: "Online Course", price: "₹15,000" },
  { value: "OFFLINE_45000", label: "Offline Course", price: "₹45,000" },
];

export default function CreateBillPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields State
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

  // Calculated Preview & Modal
  const [previewData, setPreviewData] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
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

  function handleStepClick(stepId: number) {
    setCurrentStep(stepId);
    if (stepId === 4) {
      setShowModal(true);
      return;
    }
    const sectionElement = document.getElementById(`step-section-${stepId}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleCreateInvoice() {
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
        setShowModal(false);
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setShowModal(false);
      setMessage(
        `Invoice ${data.bill.billNumber} created successfully! ` +
          (data.emailSent
            ? "PDF invoice was emailed directly to the student."
            : "Invoice was saved to database, but email delivery failed. You can resend it anytime from Invoices History.")
      );

      // Reset Form
      setCourseName("");
      setStudentName("");
      setEmail("");
      setPhone("");
      setCustomerAddress("");
      setCustomerCity("");
      setCustomerPostalCode("");
      setCustomerGstin("");
      setCurrentStep(1);
    } catch (err) {
      console.error(err);
      setMessage("An error occurred while creating the invoice.");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    setShowModal(true);
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          Create New Invoice
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate a professional GST course invoice and email the PDF directly to the student.
        </p>
      </div>

      {!isConfigured && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 flex items-center justify-between text-xs font-semibold">
          <div>
            <p className="font-bold text-amber-950">TAX CONFIGURATION INCOMPLETE</p>
            <p className="text-gray-700 mt-0.5">Configure company tax details before issuing official GST tax invoices.</p>
          </div>
          <a
            href="/dashboard/settings"
            className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-xs"
          >
            Configure Tax Settings
          </a>
        </div>
      )}

      {/* 4-Step Interactive Stepper Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs text-xs font-semibold sticky top-16 z-20 backdrop-blur-md">
        {[
          { id: 1, label: "Course Details" },
          { id: 2, label: "Student Details" },
          { id: 3, label: "Tax Details" },
          { id: 4, label: "Review & Create" },
        ].map((step) => {
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleStepClick(step.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                isActive
                  ? "bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-xs"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  isActive ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.id}
              </span>
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Container */}
        <form onSubmit={handleFormSubmit} className="space-y-6 lg:col-span-2">
          {/* SECTION 1: COURSE DETAILS */}
          <div
            id="step-section-1"
            onFocus={() => setCurrentStep(1)}
            className={`rounded-3xl border bg-white p-6 sm:p-8 space-y-6 shadow-xs transition-all ${
              currentStep === 1 ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-xs">1</span>
              <h2 className="text-base font-bold text-gray-900">Course Details</h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Course Name</label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Example: Full Stack Web Development"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Select Course Type / Fee</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courseOptions.map((o) => {
                  const selected = courseType === o.value;
                  return (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => setCourseType(o.value)}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        selected
                          ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-200"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-bold ${selected ? "text-orange-600" : "text-gray-800"}`}>{o.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{o.value}</p>
                      </div>
                      <span className={`text-sm font-extrabold ${selected ? "text-orange-600" : "text-gray-900"}`}>{o.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: STUDENT / BILL TO DETAILS */}
          <div
            id="step-section-2"
            onFocus={() => setCurrentStep(2)}
            className={`rounded-3xl border bg-white p-6 sm:p-8 space-y-6 shadow-xs transition-all ${
              currentStep === 2 ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-xs">2</span>
              <h2 className="text-base font-bold text-gray-900">Student & Billing Details</h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Student Full Name</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="John Doe"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Billing Address Line</label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Flat / House No., Street, Landmark"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">City</label>
                <input
                  type="text"
                  required
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Hyderabad"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">State</label>
                <select
                  value={customerState}
                  onChange={(e) => {
                    setCustomerState(e.target.value);
                    setPlaceOfSupply(e.target.value);
                  }}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Postal Code</label>
                <input
                  type="text"
                  required
                  value={customerPostalCode}
                  onChange={(e) => setCustomerPostalCode(e.target.value)}
                  placeholder="500081"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Customer GSTIN (Optional)</label>
              <input
                type="text"
                maxLength={15}
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                placeholder="36AAAAA0000A1Z5"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-mono focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* SECTION 3: TAX DETAILS */}
          <div
            id="step-section-3"
            onFocus={() => setCurrentStep(3)}
            className={`rounded-3xl border bg-white p-6 sm:p-8 space-y-6 shadow-xs transition-all ${
              currentStep === 3 ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-xs">3</span>
              <h2 className="text-base font-bold text-gray-900">Tax & Supply Parameters</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Place of Supply</label>
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Price Type</label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                >
                  <option value="TAX_INCLUSIVE">Tax Inclusive</option>
                  <option value="TAX_EXCLUSIVE">Tax Exclusive</option>
                </select>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-2xl p-4 text-xs font-semibold border ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Form Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-4">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(4);
                setShowModal(true);
              }}
              className="w-full sm:w-auto rounded-xl border-2 border-orange-500 bg-white px-6 py-3.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors shadow-xs cursor-pointer"
            >
              Preview Invoice
            </button>
            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full sm:flex-1 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-md shadow-orange-500/20 active:scale-[0.99] cursor-pointer"
            >
              {loading ? "Creating & Emailing..." : "Create & Email Invoice"}
            </button>
          </div>
        </form>

        {/* Live Invoice Summary (Sticky Desktop Sidebar) */}
        <div>
          <div className="sticky top-32 rounded-3xl border border-gray-200 bg-white p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base">INVOICE SUMMARY</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                Live Tax Engine
              </span>
            </div>

            {previewData ? (
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Course</span>
                  <span className="font-semibold text-gray-900">{courseName || "Web Development"}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Base Course Price</span>
                  <span className="font-semibold text-gray-900">₹{previewData.baseAmount.toLocaleString("en-IN")}</span>
                </div>

                {previewData.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{previewData.discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-3">
                  <span>Taxable Value</span>
                  <span className="font-semibold text-gray-900">₹{previewData.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>

                {previewData.isIntraState ? (
                  <>
                    <div className="flex justify-between text-gray-500 pl-3">
                      <span>CGST ({previewData.cgstRate}%)</span>
                      <span>₹{previewData.cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 pl-3">
                      <span>SGST ({previewData.sgstRate}%)</span>
                      <span>₹{previewData.sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-gray-500 pl-3">
                    <span>IGST ({previewData.igstRate}%)</span>
                    <span>₹{previewData.igstAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700 font-semibold border-t border-gray-100 pt-2">
                  <span>Total Tax</span>
                  <span>₹{previewData.totalTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-b border-orange-100 text-sm font-extrabold bg-orange-50/60 px-3.5 rounded-xl text-gray-900">
                  <span>GRAND TOTAL</span>
                  <span className="text-orange-600 text-base">₹{previewData.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>

                <p className="text-[11px] text-gray-400 text-center pt-1">
                  Tax rule calculated automatically for supply in <strong className="text-gray-700">{placeOfSupply}</strong>
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-4">Calculating summary...</p>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleCreateInvoice}
        loading={loading}
        data={{
          studentName,
          email,
          phone,
          customerAddress,
          customerCity,
          customerState,
          customerPostalCode,
          customerGstin,
          courseName: courseName || "Web Development",
          courseType,
          placeOfSupply,
          priceType,
          calculation: previewData,
        }}
      />
    </div>
  );
}
