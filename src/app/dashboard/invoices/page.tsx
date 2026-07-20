"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

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
      <div className="flex justify-center items-center p-12 text-xs font-semibold text-gray-400">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Invoices History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View, download, and manage all generated student course invoices.
          </p>
        </div>
        <a
          href="/dashboard/create-bill"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
        >
          + Create New Invoice
        </a>
      </div>

      {actionMessage && (
        <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 text-xs font-semibold text-orange-800">
          {actionMessage}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by student name, email, invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="EMAIL_FAILED">Email Failed</option>
            <option value="CREATED">Draft Created</option>
          </select>
        </div>
      </div>

      {/* Invoice Table Container */}
      <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Invoice No.</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Taxable</th>
                <th className="p-4">GST</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Date</th>
                <th className="p-4">Email Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="p-4 font-mono font-bold text-gray-900">{bill.billNumber}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{bill.studentName}</p>
                    <p className="text-gray-400 text-[11px]">{bill.email}</p>
                  </td>
                  <td className="p-4 text-gray-700 font-medium">{bill.courseName}</td>
                  <td className="p-4 font-mono">₹{Number(bill.taxableAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono text-gray-500">₹{Number(bill.totalTax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono font-bold text-gray-900">
                    ₹{Number(bill.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-gray-500">{new Date(bill.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <StatusBadge status={bill.status} />
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <a
                      href={`/api/bills/${bill.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                    >
                      View PDF
                    </a>
                    <button
                      onClick={() => handleResendEmail(bill.id)}
                      disabled={resendingId === bill.id}
                      className="inline-flex items-center rounded-xl bg-orange-500 px-3 py-1.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {resendingId === bill.id ? "Sending..." : "Resend Email"}
                    </button>
                  </td>
                </tr>
              ))}

              {!filteredBills.length && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
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
