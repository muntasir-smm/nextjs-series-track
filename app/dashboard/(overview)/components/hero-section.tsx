// app/dashboard/(overview)/components/hero-section.tsx

"use client";

import Avatar from "@/app/ui/dashboard/avatar";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface HeroSectionProps {
  userName: string;
  avatarUrl: string | null;
  greeting: string;
  totalSeries: number;
  overallProgress: number;
  completedSeries: number;
  hasSeries: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  userName,
  avatarUrl,
  greeting,
  totalSeries,
  overallProgress,
  completedSeries,
  hasSeries,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-6 text-white shadow-xl">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-white/20 to-white/10 p-1.5 backdrop-blur-sm">
              <Avatar
                src={avatarUrl}
                name={userName || "User"}
                size="xl"
                shape="rounded"
                className="h-20 w-20 md:h-24 md:w-24"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1.5 ring-2 ring-white">
              <CheckCircleIcon className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100">{greeting}</p>
            <h1 className="text-2xl font-bold mt-0.5 md:text-3xl">
              {userName || "User"}! 👋
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              {totalSeries} {totalSeries === 1 ? "series" : "series"} •{" "}
              {overallProgress}% complete
            </p>
          </div>
        </div>

        {completedSeries >= 5 && (
          <div className="flex items-center gap-2 rounded-full bg-yellow-500/30 backdrop-blur-sm px-3 py-1.5 text-sm">
            <span className="text-lg">🏆</span>
            <span>Series Master</span>
          </div>
        )}
        {completedSeries >= 1 && completedSeries < 5 && hasSeries && (
          <div className="flex items-center gap-2 rounded-full bg-blue-500/30 backdrop-blur-sm px-3 py-1.5 text-sm">
            <span className="text-lg">⭐</span>
            <span>{5 - completedSeries} to Master</span>
          </div>
        )}
        {completedSeries === 0 && hasSeries && (
          <div className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-sm">
            <span className="text-lg">🎯</span>
            <span>Complete first series</span>
          </div>
        )}
      </div>
    </div>
  );
};
