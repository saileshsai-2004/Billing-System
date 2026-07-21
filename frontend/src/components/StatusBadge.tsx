import React from "react";

type StatusBadgeProps = {
  status: "SENT" | "EMAIL_FAILED" | "CREATED" | string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  let styles = "bg-orange-50 text-orange-700 border-orange-200";
  let label = status.replace("_", " ");

  if (status === "SENT") {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    label = "Sent";
  } else if (status === "EMAIL_FAILED") {
    styles = "bg-red-50 text-red-700 border-red-200";
    label = "Email Failed";
  } else if (status === "CREATED") {
    styles = "bg-amber-50 text-amber-700 border-amber-200";
    label = "Draft Created";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "SENT" ? "bg-emerald-500" : status === "EMAIL_FAILED" ? "bg-red-500" : "bg-amber-500"}`} />
      {label}
    </span>
  );
}
