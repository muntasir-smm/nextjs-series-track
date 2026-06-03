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

const iconMap = {
  UserIcon: UserIcon,
  ClockIcon: ClockIcon,
  CheckCircleIcon: CheckCircleIcon,
  NoSymbolIcon: NoSymbolIcon,
  ShieldCheckIcon: ShieldCheckIcon,
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
      className={`relative overflow-hidden rounded-xl p-4 transition-all duration-200 ${
        isActive
          ? `bg-gradient-to-br ${color} shadow-lg scale-[1.02]`
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-[1.01]"
      }`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <Icon
            className={`h-5 w-5 ${isActive ? "text-white/80" : "text-gray-400"}`}
          />
          <span
            className={`text-2xl font-bold ${isActive ? "text-white" : "text-gray-900 dark:text-white"}`}
          >
            {value}
          </span>
        </div>
        <p
          className={`mt-2 text-xs font-medium ${isActive ? "text-white/70" : "text-gray-500"}`}
        >
          {label}
        </p>
      </div>
      {isActive && (
        <div className="absolute inset-0 bg-white/10 rounded-xl pointer-events-none" />
      )}
    </button>
  );
}
