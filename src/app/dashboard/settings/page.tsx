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

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "ADYAPAN EDUTECH PVT. LTD.",
    tradeName: "ADYAPAN",
    address: "",
    city: "",
    state: "Telangana",
    stateCode: "36",
    postalCode: "",
    gstin: "",
    pan: "",
    email: "",
    phone: "",
    website: "www.adyapan.com",
    sacCode: "999293",
    gstRate: 18.0,
    defaultPriceType: "TAX_INCLUSIVE",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setFormData({
            companyName: data.settings.companyName || "ADYAPAN EDUTECH PVT. LTD.",
            tradeName: data.settings.tradeName || "ADYAPAN",
            address: data.settings.address || "",
            city: data.settings.city || "",
            state: data.settings.state || "Telangana",
            stateCode: data.settings.stateCode || "36",
            postalCode: data.settings.postalCode || "",
            gstin: data.settings.gstin || "",
            pan: data.settings.pan || "",
            email: data.settings.email || "",
            phone: data.settings.phone || "",
            website: data.settings.website || "www.adyapan.com",
            sacCode: data.settings.sacCode || "999293",
            gstRate: Number(data.settings.gstRate) || 18.0,
            defaultPriceType: data.settings.defaultPriceType || "TAX_INCLUSIVE",
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          gstRate: Number(formData.gstRate),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Failed to update tax configuration");
        setSaving(false);
        return;
      }

      setMessage("Tax configuration saved successfully!");
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("An unexpected error occurred while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-slate-500">Loading tax settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Company & Tax Settings</h1>
        <p className="mt-2 text-slate-500">
          Configure accountant-verified company tax details, GSTIN, supplier state, and tax rates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Identity */}
        <div className="rounded-2xl border bg-white p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Company Identity</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Company Legal Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Trade Name / Brand</label>
              <input
                type="text"
                required
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Company Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Company Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* GST & Registration Details */}
        <div className="rounded-2xl border bg-white p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-3">GST & Tax Registration</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700">GSTIN (15 Digits)</label>
              <input
                type="text"
                required
                maxLength={15}
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="36AAAAA0000A1Z5"
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">PAN Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="AAAAA0000A"
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">SAC Code</label>
              <input
                type="text"
                required
                value={formData.sacCode}
                onChange={(e) => setFormData({ ...formData, sacCode: e.target.value })}
                placeholder="999293"
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Default GST Rate (%)</label>
              <input
                type="number"
                step="0.01"
                required
                min={0}
                max={100}
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: parseFloat(e.target.value) || 0 })}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Default Price Type</label>
              <select
                value={formData.defaultPriceType}
                onChange={(e) => setFormData({ ...formData, defaultPriceType: e.target.value })}
                className="mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm"
              >
                <option value="TAX_INCLUSIVE">Tax Inclusive</option>
                <option value="TAX_EXCLUSIVE">Tax Exclusive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Registered Address & State */}
        <div className="rounded-2xl border bg-white p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Registered Address & Supplier State</h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Registered Address Line</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Supplier State</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">State Code</label>
              <input
                type="text"
                required
                value={formData.stateCode}
                onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                placeholder="36"
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Postal Code</label>
            <input
              type="text"
              required
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        {message && (
          <div
            className={`rounded-lg p-4 text-sm font-medium ${
              isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {saving ? "Saving Settings..." : "Save Tax Configuration"}
        </button>
      </form>
    </div>
  );
}
