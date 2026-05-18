// app/admin/components/StatCard.tsx

"use client";

import { ReactNode } from "react";

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
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  purple:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  orange:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p
              className={`mt-1 text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`rounded-full p-3 ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
