// app/ui/tvSeries/series-list.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ProgressBar, ProgressRing } from "./progress-bar";
import {
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { updateWatchProgress } from "@/app/lib/series";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

const getPosterUrl = (
  posterPath: string | null | undefined,
  size: string = "w342",
) => {
  if (!posterPath) return null;
  if (posterPath.startsWith("http")) return posterPath;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

interface Series {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchedSeasons: boolean[];
  watchProgress: number;
  voteAverage?: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string | null;
  firstAirDate?: string | null;
  genres?: string[];
}

interface SeriesListProps {
  series: Series[] | undefined;
  updateSeries: (updatedSeries: Series[]) => void;
  deleteSeries: (id: string) => void;
  onEditSeries?: (series: Series) => void;
  viewMode: "grid" | "list";
}

const StatusBadge: React.FC<{ status: string; hasUpcoming: boolean }> = ({
  status,
  hasUpcoming,
}) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
      hasUpcoming
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    )}
  >
    {hasUpcoming ? status : "Ended"}
  </span>
);

const SeasonCheckbox: React.FC<{
  seasonNumber: number;
  watched: boolean;
  onToggle: () => void;
  isUpdating: boolean;
}> = ({ seasonNumber, watched, onToggle, isUpdating }) => (
  <button
    onClick={onToggle}
    disabled={isUpdating}
    className={clsx(
      "relative flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
      watched
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
        : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
      isUpdating && "cursor-not-allowed opacity-50",
    )}
  >
    <span>S{seasonNumber}</span>
    {watched && (
      <CheckCircleIcon className="absolute -right-1 -top-1 h-3.5 w-3.5 text-emerald-500" />
    )}
  </button>
);

const SeriesList: React.FC<SeriesListProps> = ({
  series,
  updateSeries,
  deleteSeries,
  onEditSeries,
  viewMode,
}) => {
  const [localSeries, setLocalSeries] = useState<Series[] | undefined>(series);
  const [updatingSeasons, setUpdatingSeasons] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    setLocalSeries(series);
  }, [series]);

  const formatProgress = useCallback((progress: number): string => {
    return Math.round(progress).toString();
  }, []);

  const calculateProgress = useCallback((watchedSeasons: boolean[]): number => {
    if (!watchedSeasons?.length) return 0;
    const watchedCount = watchedSeasons.filter(Boolean).length;
    return Math.round((watchedCount / watchedSeasons.length) * 100);
  }, []);

  const toggleWatched = useCallback(
    async (seriesIndex: number, seasonIndex: number) => {
      if (!localSeries) return;

      const updateKey = `${seriesIndex}-${seasonIndex}`;
      if (updatingSeasons.has(updateKey)) return;

      setUpdatingSeasons((prev) => new Set(prev).add(updateKey));

      try {
        const updatedSeries = [...localSeries];
        updatedSeries[seriesIndex].watchedSeasons[seasonIndex] =
          !updatedSeries[seriesIndex].watchedSeasons[seasonIndex];
        updatedSeries[seriesIndex].watchProgress = calculateProgress(
          updatedSeries[seriesIndex].watchedSeasons,
        );

        setLocalSeries(updatedSeries);
        updateSeries(updatedSeries);

        const currentSeries = updatedSeries[seriesIndex];
        await updateWatchProgress(
          currentSeries.id,
          currentSeries.watchedSeasons,
        );
      } catch (error) {
        console.error("Failed to update watch progress:", error);
        setLocalSeries(series);
      } finally {
        setUpdatingSeasons((prev) => {
          const next = new Set(prev);
          next.delete(updateKey);
          return next;
        });
      }
    },
    [localSeries, calculateProgress, updateSeries, series, updatingSeasons],
  );

  const renderWatchedSeasons = useCallback(
    (watchedSeasons: boolean[], seriesIndex: number) => {
      if (!watchedSeasons?.length) return null;

      return (
        <div className="flex flex-wrap gap-1.5">
          {watchedSeasons.map((watched, seasonIndex) => {
            const updateKey = `${seriesIndex}-${seasonIndex}`;
            const isUpdating = updatingSeasons.has(updateKey);

            return (
              <SeasonCheckbox
                key={seasonIndex}
                seasonNumber={seasonIndex + 1}
                watched={watched}
                onToggle={() => toggleWatched(seriesIndex, seasonIndex)}
                isUpdating={isUpdating}
              />
            );
          })}
        </div>
      );
    },
    [toggleWatched, updatingSeasons],
  );

  const getUpcomingSeasonInfo = useCallback(
    (
      upcomingSeasons: string[],
      totalSeasons: number,
    ): { text: string; hasUpcoming: boolean } => {
      if (!upcomingSeasons?.length) {
        return { text: "Series Ended", hasUpcoming: false };
      }

      const nextSeasonNumber = totalSeasons + 1;
      const expectedNextSeason = `Season ${nextSeasonNumber}`;

      if (upcomingSeasons.includes(expectedNextSeason)) {
        const seasonNum = nextSeasonNumber.toString().padStart(2, "0");
        return { text: `S${seasonNum}`, hasUpcoming: true };
      }

      const firstUpcoming = upcomingSeasons[0];
      const seasonNumber = firstUpcoming.match(/\d+/)?.[0];
      if (seasonNumber) {
        return {
          text: `S${seasonNumber.padStart(2, "0")}`,
          hasUpcoming: true,
        };
      }

      return {
        text: firstUpcoming.replace("Season", ""),
        hasUpcoming: true,
      };
    },
    [],
  );

  const memoizedSeries = useMemo(() => localSeries, [localSeries]);

  if (!memoizedSeries?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/40">
          <svg
            className="h-8 w-8 text-brand-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          No series yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add your first series to start tracking!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {memoizedSeries.map((s) => {
            const posterUrl = getPosterUrl(s.posterPath, "w342");
            const { text: statusText, hasUpcoming } = getUpcomingSeasonInfo(
              s.upcomingSeasons,
              s.totalSeasons,
            );

            return (
              <div
                key={s.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={s.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
                      <span className="text-3xl font-bold text-white">
                        {s.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute right-2 top-2 z-10">
                    <StatusBadge
                      status={statusText}
                      hasUpcoming={hasUpcoming}
                    />
                  </div>

                  <div className="absolute bottom-2 right-2 z-10">
                    <ProgressRing progress={s.watchProgress} size="sm" />
                  </div>

                  <div className="absolute bottom-2 left-2 z-10 rounded-lg bg-black/50 px-1.5 py-0.5 backdrop-blur-sm">
                    <span className="text-[10px] font-medium text-white">
                      {s.totalSeasons}{" "}
                      {s.totalSeasons === 1 ? "Season" : "Seasons"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 p-3">
                  <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {s.name}
                  </h3>
                  {s.overview && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 text-justify">
                      {s.overview}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-0.5 border-t border-slate-100 pt-2 dark:border-slate-800">
                    <Link
                      href={`/dashboard/tvSeries/${s.id}`}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onEditSeries?.(s)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30"
                      title="Edit Series"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSeries(s.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      title="Delete Series"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {memoizedSeries.map((s, seriesIndex) => {
            const posterUrl = getPosterUrl(s.posterPath, "w185");
            const { text: statusText, hasUpcoming } = getUpcomingSeasonInfo(
              s.upcomingSeasons,
              s.totalSeasons,
            );

            return (
              <div
                key={s.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Poster */}
                  <div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-20">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={s.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[100px] items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
                        <span className="text-xl font-bold text-white">
                          {s.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {s.name}
                      </h3>
                      <StatusBadge
                        status={statusText}
                        hasUpcoming={hasUpcoming}
                      />
                    </div>

                    {s.overview && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {s.overview}
                      </p>
                    )}

                    <div className="mt-3">
                      {renderWatchedSeasons(s.watchedSeasons, seriesIndex)}
                    </div>

                    <div className="mt-3 max-w-[180px]">
                      <ProgressBar
                        width={`${s.watchProgress}%`}
                        size="sm"
                        showPercentage
                      >
                        {formatProgress(s.watchProgress)}%
                      </ProgressBar>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1 border-t border-slate-100 p-3 sm:flex-col sm:border-l sm:border-t-0 dark:border-slate-800">
                    <Link
                      href={`/dashboard/tvSeries/${s.id}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onEditSeries?.(s)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30"
                      title="Edit Series"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSeries(s.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      title="Delete Series"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeriesList;
