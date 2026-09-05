// app/admin/components/StatCard.tsx

"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colors = {
  blue: "bg-brand-100 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400",
  green:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  purple:
    "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  orange:
    "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
  red: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p
              className={clsx(
                "mt-1 text-xs font-medium",
                trend.isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={clsx("rounded-xl p-3", colors[color])}>{icon}</div>
      </div>
    </div>
  );
}
