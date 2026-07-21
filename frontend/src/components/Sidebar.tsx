"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetchApi("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Create Bill", href: "/dashboard/create-bill" },
    { label: "Invoices", href: "/dashboard/invoices" },
    { label: "Tax Settings", href: "/dashboard/settings" },
  ];

  return (
    <aside className="w-64 min-h-screen border-r bg-white p-5 hidden md:block">
      <div className="mb-10">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">ADYAPAN</h2>
        <p className="text-xs font-medium text-slate-500">GST Billing System</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="w-full text-left rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition mt-6"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
