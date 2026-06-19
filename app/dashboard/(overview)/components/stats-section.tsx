// app/dashboard/(overview)/components/stats-section.tsx

"use client";

import { memo, useEffect, useState } from "react";
import {
  TvIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

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

// Extract StatCard as memoized component to prevent unnecessary re-renders
const StatCard = memo<{
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "teal" | "orange";
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
        bg: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30",
        text: "text-blue-700 dark:text-blue-300",
        icon: "text-blue-600 dark:text-blue-400",
        bar: "from-blue-500 to-blue-600",
        ringTrack: "text-blue-200 dark:text-blue-800",
        ringFill: "text-blue-500",
        ringText: "text-blue-700 dark:text-blue-300",
      },
      green: {
        bg: "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30",
        text: "text-green-700 dark:text-green-300",
        icon: "text-green-600 dark:text-green-400",
        bar: "from-green-500 to-green-600",
        ringTrack: "text-green-200 dark:text-green-800",
        ringFill: "text-green-500",
        ringText: "text-green-700 dark:text-green-300",
      },
      purple: {
        bg: "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30",
        text: "text-purple-700 dark:text-purple-300",
        icon: "text-purple-600 dark:text-purple-400",
        bar: "from-purple-500 to-purple-600",
        ringTrack: "text-purple-200 dark:text-purple-800",
        ringFill: "text-purple-500",
        ringText: "text-purple-700 dark:text-purple-300",
      },
      teal: {
        bg: "from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30",
        text: "text-teal-700 dark:text-teal-300",
        icon: "text-teal-600 dark:text-teal-400",
        bar: "from-teal-500 to-teal-600",
        ringTrack: "text-teal-200 dark:text-teal-800",
        ringFill: "text-teal-500",
        ringText: "text-teal-700 dark:text-teal-300",
      },
      orange: {
        bg: "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30",
        text: "text-orange-700 dark:text-orange-300",
        icon: "text-orange-600 dark:text-orange-400",
        bar: "from-orange-500 to-orange-600",
        ringTrack: "text-orange-200 dark:text-orange-800",
        ringFill: "text-orange-500",
        ringText: "text-orange-700 dark:text-orange-300",
      },
    };

    const style = colors[color];
    const circumference = 2 * Math.PI * 24; // r=24
    const dashOffset = circumference * (1 - progress / 100);

    return (
      <div
        className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${style.bg} p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
      >
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-medium ${style.text}`}>{title}</p>
              {showProgressRing ? (
                <div className="relative h-14 w-14 mt-1">
                  <svg className="h-14 w-14 -rotate-90 transform">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className={style.ringTrack}
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      className={`${style.ringFill} transition-all duration-500`}
                    />
                  </svg>
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-base font-bold ${style.ringText}`}
                  >
                    {value}
                    {suffix}
                  </span>
                </div>
              ) : (
                <p
                  className={`text-2xl font-bold text-gray-900 dark:text-white mt-1`}
                >
                  {value}
                  {suffix}
                </p>
              )}
            </div>
            <div className="rounded-full bg-white/50 p-2.5 backdrop-blur-sm transition-colors group-hover:bg-white/70 dark:bg-white/10 dark:group-hover:bg-white/20">
              <Icon className={`h-5 w-5 ${style.icon}`} />
            </div>
          </div>
        </div>
        <div
          className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${style.bar} opacity-0 transition-opacity group-hover:opacity-100`}
        />
      </div>
    );
  },
);

StatCard.displayName = "StatCard";

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  userName,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      window.dispatchEvent(new CustomEvent("refresh-stats"));
      setTimeout(() => setIsRefreshing(false), 500);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen for manual refresh events
  useEffect(() => {
    const handleRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    };

    window.addEventListener("series-added", handleRefresh);
    window.addEventListener("refresh-stats", handleRefresh);

    return () => {
      window.removeEventListener("series-added", handleRefresh);
      window.removeEventListener("refresh-stats", handleRefresh);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 dark:from-gray-900/80 dark:via-gray-800/50 dark:to-gray-900/80 p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
      {/* Decorative background elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/5 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {userName}&apos;s Statistics
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Overview of your tracking progress
              {isRefreshing && (
                <span className="ml-2 inline-block animate-pulse text-xs text-blue-500">
                  updating...
                </span>
              )}
            </p>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Live
            </span>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
            color="purple"
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
    </div>
  );
};
