import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { API_URL } from "@/lib/api";

export const revalidate = 0;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

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

      {!settings?.isConfigured && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 flex items-center justify-between text-xs font-semibold">
          <span>TAX CONFIGURATION INCOMPLETE: Company tax details and GST rate need configuration.</span>
          <a href="/dashboard/settings" className="underline font-bold text-amber-950">
            Configure Now →
          </a>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Invoices"
          value={totalInvoices}
          subtitle="Issued to date"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <StatCard
          title="Total Revenue"
          value={`₹${totalValue.toLocaleString("en-IN")}`}
          subtitle="Grand total billed"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total GST"
          value={`₹${totalTax.toLocaleString("en-IN")}`}
          subtitle={`Taxable: ₹${totalTaxable.toLocaleString("en-IN")}`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          }
        />

        <StatCard
          title="Email Failed"
          value={emailFailedCount}
          subtitle="Pending email resend"
          isAlert={emailFailedCount > 0}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Invoices Table Section */}
      <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gray-50/50">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Recent Invoices</h2>
            <p className="text-xs text-gray-500">Latest student course invoices generated by the system</p>
          </div>
          <a href="/dashboard/invoices" className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline">
            View All Invoices →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Invoice No.</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Taxable</th>
                <th className="p-4">GST</th>
                <th className="p-4">Total</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="p-4 font-mono font-bold text-gray-900">{bill.billNumber}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{bill.studentName}</p>
                    <p className="text-gray-400 text-[11px]">{bill.email}</p>
                  </td>
                  <td className="p-4 text-gray-700 font-medium">{bill.courseName}</td>
                  <td className="p-4 font-mono">₹{Number(bill.taxableAmount || 0).toLocaleString("en-IN")}</td>
                  <td className="p-4 font-mono text-gray-500">₹{Number(bill.totalTax || 0).toLocaleString("en-IN")}</td>
                  <td className="p-4 font-mono font-bold text-gray-900">
                    ₹{Number(bill.grandTotal || bill.amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-gray-500">{new Date(bill.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <StatusBadge status={bill.status} />
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`${API_URL}/api/bills/${bill.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {!bills.length && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    No invoices created yet. Create your first course invoice.
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
