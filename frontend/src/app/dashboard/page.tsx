import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import PdfButton from "@/components/PdfButton";

export const revalidate = 0;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  let bills: any[] = [];
  let totalInvoices = 0;
  let aggregates: any = { _sum: { grandTotal: 0, taxableAmount: 0, totalTax: 0, amount: 0 } };
  let emailFailedCount = 0;
  let settings: any = null;

  try {
    if (process.env.DATABASE_URL) {
      [bills, totalInvoices, aggregates, emailFailedCount, settings] = await Promise.all([
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
    }
  } catch (err) {
    console.error("Dashboard DB load notice:", err);
  }

  const totalValue = Number(aggregates?._sum?.grandTotal || aggregates?._sum?.amount || 0);
  const totalTaxable = Number(aggregates?._sum?.taxableAmount || 0);
  const totalTax = Number(aggregates?._sum?.totalTax || 0);

  const greeting = getGreeting();

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            {greeting}, Admin 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s an overview of your billing activity and real-time GST collections.
          </p>
        </div>
        <a
          href="/dashboard/create-bill"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Invoice
        </a>
      </div>

      {settings && !settings.isConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-6 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-amber-950">Tax Configuration Required</h3>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                Set up your company GSTIN, SAC code, state code, and tax rules before creating invoices.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/settings"
            className="shrink-0 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors shadow-sm"
          >
            Configure Tax Settings
          </a>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Invoices"
          value={totalInvoices.toLocaleString("en-IN")}
          subtitle="Issued to date"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalValue.toLocaleString("en-IN")}`}
          subtitle="Grand total billed"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Total GST"
          value={`₹${totalTax.toLocaleString("en-IN")}`}
          subtitle={`Taxable: ₹${totalTaxable.toLocaleString("en-IN")}`}
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>}
        />
        <StatCard
          title="Email Failed"
          value={emailFailedCount.toLocaleString("en-IN")}
          subtitle="Pending email resend"
          isAlert={emailFailedCount > 0}
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      {/* Recent Activity Table Container */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Recent Student Invoices</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest student course invoices generated by the system
            </p>
          </div>
          <a
            href="/dashboard/invoices"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
          >
            View All Invoices &rarr;
          </a>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm text-gray-600 min-w-[640px]">
            <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-y border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold">No invoices generated yet.</p>
                    <p className="text-xs mt-1 text-gray-400">Click &quot;Create New Invoice&quot; to issue your first student bill.</p>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-gray-900">
                      {bill.billNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      <div>{bill.studentName}</div>
                      <div className="text-xs font-normal text-gray-400">{bill.email}</div>
                    </td>
                    <td className="py-4 px-4">{bill.courseName}</td>
                    <td className="py-4 px-4 font-extrabold text-gray-900">
                      ₹{Number(bill.grandTotal || bill.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={bill.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <PdfButton billId={bill.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
