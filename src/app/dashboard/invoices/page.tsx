"use client";

import { useEffect, useState } from "react";

type Bill = {
  id: string;
  billNumber: string;
  courseName: string;
  studentName: string;
  email: string;
  phone: string;
  taxableAmount: number;
  totalTax: number;
  grandTotal: number;
  status: "CREATED" | "SENT" | "EMAIL_FAILED";
  emailSent: boolean;
  createdAt: string;
};

export default function InvoicesPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const fetchBills = async () => {
    try {
      const res = await fetch("/api/bills");
      const data = await res.json();
      if (data.success) {
        setBills(data.bills);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleResendEmail = async (id: string) => {
    setResendingId(id);
    setActionMessage("");
    try {
      const res = await fetch(`/api/bills/${id}/resend`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Email resent successfully for invoice.`);
        fetchBills();
      } else {
        setActionMessage(data.message || "Failed to resend email.");
      }
    } catch (err) {
      console.error(err);
      setActionMessage("Error occurred while resending email.");
    } finally {
      setResendingId(null);
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      bill.studentName.toLowerCase().includes(search.toLowerCase()) ||
      bill.email.toLowerCase().includes(search.toLowerCase()) ||
      bill.courseName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 text-slate-500">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
          <p className="mt-2 text-slate-500">
            View, download, and manage all issued GST tax invoices.
          </p>
        </div>
        <a
          href="/dashboard/create-bill"
          className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition text-sm"
        >
          + Create New Invoice
        </a>
      </div>

      {actionMessage && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800 font-medium">
          {actionMessage}
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-4">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search by invoice #, student name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="EMAIL_FAILED">Email Failed</option>
            <option value="CREATED">Created</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Taxable</th>
                <th className="p-4">Tax</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Date</th>
                <th className="p-4">Email Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-mono font-semibold text-slate-900">{bill.billNumber}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{bill.studentName}</p>
                    <p className="text-xs text-slate-500">{bill.email}</p>
                  </td>
                  <td className="p-4 text-slate-700">{bill.courseName}</td>
                  <td className="p-4 font-mono">₹{Number(bill.taxableAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono text-slate-600">₹{Number(bill.totalTax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">₹{Number(bill.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-slate-500 text-xs">{new Date(bill.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        bill.status === "SENT"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : bill.status === "EMAIL_FAILED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {bill.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <a
                      href={`/api/bills/${bill.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      View PDF
                    </a>
                    <button
                      onClick={() => handleResendEmail(bill.id)}
                      disabled={resendingId === bill.id}
                      className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                    >
                      {resendingId === bill.id ? "Sending..." : "Resend Email"}
                    </button>
                  </td>
                </tr>
              ))}

              {!filteredBills.length && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No matching invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
