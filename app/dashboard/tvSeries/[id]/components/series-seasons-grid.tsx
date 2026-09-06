// app/dashboard/tvSeries/[id]/components/series-seasons-grid.tsx

"use client";

import { CheckIcon, TvIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface Props {
  watchedSeasons: boolean[];
  updatingSeason: number | null;
  onToggle: (index: number) => void;
}

export function SeriesSeasonsGrid({
  watchedSeasons,
  updatingSeason,
  onToggle,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-violet-100 p-2 dark:bg-violet-950/40">
          <TvIcon className="h-5 w-5 text-violet-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Seasons
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {watchedSeasons.map((watched, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onToggle(index)}
            disabled={updatingSeason === index}
            className={clsx(
              "relative overflow-hidden rounded-xl border p-4 transition",
              watched
                ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                : "border-slate-200 bg-slate-50 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800",
              updatingSeason === index && "cursor-not-allowed opacity-50",
            )}
          >
            <div className="text-center">
              <div className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                Season {index + 1}
              </div>
              {watched ? (
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-600">
                  <CheckIcon className="h-4 w-4" />
                  Watched
                </div>
              ) : (
                <div className="text-xs text-slate-500">Not watched</div>
              )}
            </div>
            {updatingSeason === index && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
