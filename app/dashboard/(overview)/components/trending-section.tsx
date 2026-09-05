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
import clsx from "clsx";

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
}) => {
  if (series.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/40">
            <FireIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Trending Now
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Popular series you might like
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/discover"
          className="text-sm font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {series.slice(0, 9).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900"
          >
            {getPosterUrl(item.posterPath) ? (
              <Image
                src={getPosterUrl(item.posterPath)!}
                alt={item.name}
                width={40}
                height={60}
                className="h-14 w-9 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-14 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white">
                {item.name.charAt(0)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {item.name}
              </h3>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{item.totalSeasons || "?"} seasons</span>
                {item.voteAverage && item.voteAverage > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">
                      •
                    </span>
                    <span className="flex items-center gap-0.5">
                      <StarIcon className="h-3 w-3 text-amber-400" />
                      {item.voteAverage.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => onAdd(item)}
              disabled={addingId === item.id}
              className={clsx(
                "flex h-8 shrink-0 items-center gap-1 rounded-xl px-2.5 text-xs font-medium transition",
                "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50",
              )}
            >
              {addingId === item.id ? (
                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PlusIcon className="h-3.5 w-3.5" />
              )}
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
