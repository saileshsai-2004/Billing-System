import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getAdminSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 p-5 md:p-8 overflow-y-auto">
        <div className="md:hidden mb-5 flex flex-wrap gap-4 text-sm font-medium border-b pb-3 bg-white p-4 rounded-xl border">
          <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>
          <a href="/dashboard/create-bill" className="hover:text-blue-600">Create Bill</a>
          <a href="/dashboard/invoices" className="hover:text-blue-600">Invoices</a>
          <a href="/dashboard/settings" className="hover:text-blue-600">Tax Settings</a>
        </div>
        {children}
      </main>
    </div>
  );
}
