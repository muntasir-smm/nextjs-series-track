// app/dashboard/(overview)/components/stats-section.tsx

"use client";

import { memo } from "react";
import {
  TvIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

interface StatsSectionProps {
  stats: {
    totalSeries: number;
    completedSeries: number;
    totalSeasons: number;
    totalWatchedSeasons: number;
    remainingSeasons: number;
    overallProgress: number;
  };
  userName: string;
}

const StatCard = memo<{
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "violet" | "teal" | "orange";
  suffix?: string;
  showProgressRing?: boolean;
  progress?: number;
}>(
  ({
    title,
    value,
    icon: Icon,
    color,
    suffix = "",
    showProgressRing = false,
    progress = 0,
  }) => {
    const colors = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        text: "text-blue-700 dark:text-blue-300",
        icon: "text-blue-600 dark:text-blue-400",
        ring: "text-blue-500",
      },
      green: {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-300",
        icon: "text-emerald-600 dark:text-emerald-400",
        ring: "text-emerald-500",
      },
      violet: {
        bg: "bg-violet-50 dark:bg-violet-950/40",
        text: "text-violet-700 dark:text-violet-300",
        icon: "text-violet-600 dark:text-violet-400",
        ring: "text-violet-500",
      },
      teal: {
        bg: "bg-teal-50 dark:bg-teal-950/40",
        text: "text-teal-700 dark:text-teal-300",
        icon: "text-teal-600 dark:text-teal-400",
        ring: "text-teal-500",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-950/40",
        text: "text-orange-700 dark:text-orange-300",
        icon: "text-orange-600 dark:text-orange-400",
        ring: "text-orange-500",
      },
    };

    const style = colors[color];
    const circumference = 2 * Math.PI * 20;
    const dashOffset = circumference * (1 - progress / 100);

    return (
      <div
        className={clsx(
          "relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-soft dark:border-slate-700/60 dark:bg-slate-900",
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className={clsx("text-xs font-medium", style.text)}>{title}</p>
            {showProgressRing ? (
              <div className="relative mt-2 h-12 w-12">
                <svg className="h-12 w-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className={clsx(style.ring, "transition-all duration-500")}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white">
                  {value}
                  {suffix}
                </span>
              </div>
            ) : (
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {value}
                {suffix}
              </p>
            )}
          </div>
          <div
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              style.bg,
            )}
          >
            <Icon className={clsx("h-4.5 w-4.5", style.icon)} />
          </div>
        </div>
      </div>
    );
  },
);

StatCard.displayName = "StatCard";

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  userName,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {userName}&apos;s Statistics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overview of your tracking progress
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Total Series"
          value={stats.totalSeries}
          icon={TvIcon}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completedSeries}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Total Seasons"
          value={stats.totalSeasons}
          icon={CalendarIcon}
          color="violet"
        />
        <StatCard
          title="Watched"
          value={stats.totalWatchedSeasons}
          icon={CheckCircleIcon}
          color="teal"
        />
        <StatCard
          title="Remaining"
          value={stats.remainingSeasons}
          icon={CalendarIcon}
          color="orange"
        />
        <StatCard
          title="Progress"
          value={stats.overallProgress}
          icon={ChartBarIcon}
          color="teal"
          suffix="%"
          showProgressRing
          progress={stats.overallProgress}
        />
      </div>
    </div>
  );
};
