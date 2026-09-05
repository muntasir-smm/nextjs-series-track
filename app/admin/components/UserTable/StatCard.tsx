// app/admin/components/UserTable/StatCard.tsx

"use client";

import {
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import type { FilterType } from "./types";
import clsx from "clsx";

const iconMap = {
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
};

interface StatCardProps {
  label: string;
  value: number;
  filter: FilterType;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  icon: keyof typeof iconMap;
  color: string;
}

export function StatCard({
  label,
  value,
  filter,
  activeFilter,
  onFilterChange,
  icon,
  color,
}: StatCardProps) {
  const Icon = iconMap[icon];
  const isActive = activeFilter === filter;

  return (
    <button
      onClick={() => onFilterChange(filter)}
      className={clsx(
        "relative overflow-hidden rounded-2xl p-4 transition-all duration-200",
        isActive
          ? `bg-gradient-to-br ${color} scale-[1.02] shadow-lg`
          : "border border-slate-200 bg-white hover:shadow-soft dark:border-slate-700 dark:bg-slate-900",
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <Icon
            className={clsx(
              "h-5 w-5",
              isActive ? "text-white/80" : "text-slate-400",
            )}
          />
          <span
            className={clsx(
              "text-2xl font-bold tracking-tight",
              isActive ? "text-white" : "text-slate-900 dark:text-white",
            )}
          >
            {value}
          </span>
        </div>
        <p
          className={clsx(
            "mt-2 text-xs font-medium",
            isActive ? "text-white/70" : "text-slate-500 dark:text-slate-400",
          )}
        >
          {label}
        </p>
      </div>
    </button>
  );
}
