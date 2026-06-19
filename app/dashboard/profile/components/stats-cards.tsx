// app/dashboard/profile/components/stats-cards.tsx

"use client";

import {
  TvIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface StatsCardsProps {
  stats: Stat[];
}

const iconMap = {
  TvIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
};

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}
              >
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
