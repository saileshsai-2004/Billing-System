import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function DashboardPage() {
  const [bills, totalInvoices, aggregates, emailFailedCount, settings] = await Promise.all([
    prisma.bill.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.bill.count(),
    prisma.bill.aggregate({
      _sum: {
        grandTotal: true,
        taxableAmount: true,
        totalTax: true,
        amount: true,
      },
    }),
    prisma.bill.count({ where: { status: "EMAIL_FAILED" } }),
    prisma.taxSettings.findUnique({ where: { id: "default" } }),
  ]);

  const totalValue = Number(aggregates._sum.grandTotal || aggregates._sum.amount || 0);
  const totalTaxable = Number(aggregates._sum.taxableAmount || 0);
  const totalTax = Number(aggregates._sum.totalTax || 0);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Dashboard</h1>
          <p className="mt-2 text-slate-500">Real-time overview of Adyapan GST invoicing and tax metrics.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/create-bill"
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition text-sm shadow-sm"
          >
            + Create Invoice
          </a>
        </div>
      </div>

      {!settings?.isConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 flex items-center justify-between text-sm font-medium">
          <span>TAX CONFIGURATION INCOMPLETE: Company tax details and GST rate need configuration.</span>
          <a href="/dashboard/settings" className="underline font-bold text-amber-950">
            Configure Now →
          </a>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Invoices</p>
          <p className="text-3xl font-bold text-slate-900">{totalInvoices}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Invoice Value</p>
          <p className="text-3xl font-bold text-slate-900">₹{totalValue.toLocaleString("en-IN")}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Taxable Value</p>
          <p className="text-3xl font-bold text-slate-900">₹{totalTaxable.toLocaleString("en-IN")}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tax Collected</p>
          <p className="text-3xl font-bold text-slate-900">₹{totalTax.toLocaleString("en-IN")}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Failed</p>
          <p className={`text-3xl font-bold ${emailFailedCount > 0 ? "text-red-600" : "text-slate-900"}`}>
            {emailFailedCount}
          </p>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b p-5 bg-slate-50/50">
          <h2 className="font-bold text-slate-900 text-lg">Recent Invoices</h2>
          <a href="/dashboard/invoices" className="text-xs font-semibold text-blue-600 hover:underline">
            View All Invoices →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs border-b">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Taxable</th>
                <th className="p-4">Tax</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-mono font-semibold text-slate-900">{bill.billNumber}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{bill.studentName}</p>
                    <p className="text-xs text-slate-500">{bill.email}</p>
                  </td>
                  <td className="p-4 text-slate-700">{bill.courseName}</td>
                  <td className="p-4 font-mono">₹{Number(bill.taxableAmount || 0).toLocaleString("en-IN")}</td>
                  <td className="p-4 font-mono text-slate-600">₹{Number(bill.totalTax || 0).toLocaleString("en-IN")}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    ₹{Number(bill.grandTotal || bill.amount || 0).toLocaleString("en-IN")}
                  </td>
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
                  <td className="p-4 text-right">
                    <a
                      href={`/api/bills/${bill.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      View PDF
                    </a>
                  </td>
                </tr>
              ))}
              {!bills.length && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No invoices created yet. Create your first GST invoice.
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
