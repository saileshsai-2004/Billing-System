"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type TopHeaderProps = {
  onToggleMobileMenu?: () => void;
};

export default function TopHeader({ onToggleMobileMenu }: TopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname.includes("/create-bill")) return "Create Invoice";
    if (pathname.includes("/invoices")) return "Invoices History";
    if (pathname.includes("/settings")) return "Company & Tax Settings";
    return "Dashboard";
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-5 md:px-8 backdrop-blur-xs">
      {/* Left side: Mobile Toggle & Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          aria-label="Open sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <nav className="flex text-xs font-medium text-gray-400 gap-1.5 items-center">
            <span>Adyapan</span>
            <span>/</span>
            <span className="text-orange-600 font-semibold">{getPageTitle()}</span>
          </nav>
          <h1 className="text-lg font-bold text-gray-900 leading-tight hidden sm:block">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side: Admin Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-gray-50 p-1.5 pr-3 hover:bg-orange-50/50 hover:border-orange-200 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 font-bold text-white text-xs">
            A
          </div>
          <span className="text-xs font-semibold text-gray-800 hidden sm:inline-block">Adyapan Admin</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180 text-orange-600" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl z-50 text-xs">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="font-bold text-gray-900">Administrator</p>
              <p className="text-gray-500 truncate text-[11px]">admin@adyapan.com</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/dashboard/settings");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-medium"
              >
                Tax Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
