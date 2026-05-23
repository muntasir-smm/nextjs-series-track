// app/dashboard/(overview)/components/trending-section.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FireIcon,
  StarIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { SuggestedSeries } from "@/app/lib/definitions";

const getPosterUrl = (
  posterPath: string | null | undefined,
  size: string = "w92",
) => {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

interface TrendingSectionProps {
  series: SuggestedSeries[];
  onAdd: (series: SuggestedSeries) => void;
  addingId: string | null;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  series,
  onAdd,
  addingId,
}) => (
  <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:from-purple-900/20 dark:to-blue-900/20">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <FireIcon className="h-6 w-6 text-orange-500" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Trending Now
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            What people are watching
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/discover"
        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        View All →
      </Link>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {series.slice(0, 12).map((series) => (
        <div
          key={series.id}
          className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getPosterUrl(series.posterPath, "w92") && (
              <Image
                src={getPosterUrl(series.posterPath, "w92")!}
                alt={series.name}
                width={32}
                height={48}
                className="h-12 w-8 rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {series.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{series.totalSeasons || "?"} seasons</span>
                {series.voteAverage && series.voteAverage > 0 && (
                  <span className="flex items-center gap-0.5">
                    <StarIcon className="h-3 w-3 text-yellow-500" />
                    {series.voteAverage.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => onAdd(series)}
            disabled={addingId === series.id}
            className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
          >
            {addingId === series.id ? (
              <ArrowPathIcon className="h-3 w-3 animate-spin" />
            ) : (
              <PlusIcon className="h-3 w-3" />
            )}
            Add
          </button>
        </div>
      ))}
    </div>
  </div>
);
