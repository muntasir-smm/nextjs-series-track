// app/dashboard/(overview)/components/stats-section.tsx

"use client";

import {
  ArrowPathIcon,
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
  onRefresh: () => void;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "teal" | "orange";
  suffix?: string;
  showProgressRing?: boolean;
  progress?: number;
}> = ({
  title,
  value,
  icon: Icon,
  color,
  suffix = "",
  showProgressRing = false,
  progress = 0,
}) => {
  const colors = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30",
    green:
      "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30",
    purple:
      "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30",
    teal: "from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30",
    orange:
      "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30",
  };

  const textColors = {
    blue: "text-blue-700 dark:text-blue-300",
    green: "text-green-700 dark:text-green-300",
    purple: "text-purple-700 dark:text-purple-300",
    teal: "text-teal-700 dark:text-teal-300",
    orange: "text-orange-700 dark:text-orange-300",
  };

  const iconColors = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
    teal: "text-teal-600 dark:text-teal-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  const barColors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    teal: "from-teal-500 to-teal-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${colors[color]} p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
    >
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs font-medium ${textColors[color]}`}>
              {title}
            </p>
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
                    className="text-teal-200 dark:text-teal-800"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${progress * 1.508} 150.8`}
                    className="text-teal-500 transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-teal-700 dark:text-teal-300">
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
            <Icon className={`h-5 w-5 ${iconColors[color]}`} />
          </div>
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${barColors[color]} opacity-0 transition-opacity group-hover:opacity-100`}
      />
    </div>
  );
};

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  onRefresh,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Statistics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of your tracking progress
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        aria-label="Refresh"
      >
        <ArrowPathIcon className="h-4 w-4" />
      </button>
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
);
