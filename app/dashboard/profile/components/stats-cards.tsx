// app/dashboard/profile/components/stats-cards.tsx

"use client";

import {
  TvIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface StatsCardsProps {
  stats: Stat[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 mt-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div
              className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}
            >
              <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </span>
          </div>
          <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
