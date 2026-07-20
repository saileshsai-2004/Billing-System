import React from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isAlert?: boolean;
  subtitle?: string;
};

export default function StatCard({ title, value, icon, isAlert = false, subtitle }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isAlert ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-bold tracking-tight ${isAlert ? "text-red-600" : "text-gray-900"}`}>{value}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
