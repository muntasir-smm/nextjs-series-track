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

// Helper function to get poster URL
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
  viewMode: "grid" | "list"; // Added viewMode prop
}

// Status Badge
const StatusBadge: React.FC<{ status: string; hasUpcoming: boolean }> = ({
  status,
  hasUpcoming,
}) => (
  <div
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      hasUpcoming
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
        : "bg-red-100 text-red-600 dark:bg-red-100 dark:text-red-400"
    }`}
  >
    {hasUpcoming ? status : "Ended"}
  </div>
);

// Season Checkbox Component
const SeasonCheckbox: React.FC<{
  seasonNumber: number;
  watched: boolean;
  onToggle: () => void;
  isUpdating: boolean;
}> = ({ seasonNumber, watched, onToggle, isUpdating }) => (
  <button
    onClick={onToggle}
    disabled={isUpdating}
    className={`relative group flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
      watched
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
        : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
    } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span className="text-sm font-bold">S{seasonNumber}</span>
    {watched && (
      <CheckCircleIcon className="w-3 h-3 absolute -top-1 -right-1 text-emerald-500" />
    )}
  </button>
);

const SeriesList: React.FC<SeriesListProps> = ({
  series,
  updateSeries,
  deleteSeries,
  onEditSeries,
  viewMode, // Receive viewMode from parent
}) => {
  const [localSeries, setLocalSeries] = useState<Series[] | undefined>(series);
  const [updatingSeasons, setUpdatingSeasons] = useState<Set<string>>(
    new Set(),
  );

  // Remove internal viewMode state - now controlled by parent

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
        <div className="flex flex-wrap gap-2">
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
        const paddedNum = seasonNumber.padStart(2, "0");
        return {
          text: `S${paddedNum}`,
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No series yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Add your first series to start tracking!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {memoizedSeries.map((s, seriesIndex) => {
            const posterUrl = getPosterUrl(s.posterPath, "w342");
            const backdropUrl = getPosterUrl(s.backdropPath, "w780");
            const { text: statusText, hasUpcoming } = getUpcomingSeasonInfo(
              s.upcomingSeasons,
              s.totalSeasons,
            );

            return (
              <div
                key={s.id}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Backdrop Gradient Overlay */}
                {backdropUrl && (
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Image
                      src={backdropUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Poster Section */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={s.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <StatusBadge
                      status={statusText}
                      hasUpcoming={hasUpcoming}
                    />
                  </div>

                  {/* Progress Ring */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <ProgressRing progress={s.watchProgress} size="md" />
                  </div>

                  {/* Season Count */}
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 z-10">
                    <span className="text-xs font-medium text-white">
                      {s.totalSeasons}{" "}
                      {s.totalSeasons === 1 ? "Season" : "Seasons"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                      {s.name}
                    </h3>
                    {s.overview && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {s.overview}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      href={`/dashboard/tvSeries/${s.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all z-10 relative"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onEditSeries?.(s)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all z-10 relative"
                      title="Edit Series"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSeries(s.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all z-10 relative"
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
                className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Poster */}
                  <div className="relative sm:w-24 h-32 sm:h-auto flex-shrink-0">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={s.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {s.name}
                          </h3>
                          {/* Status Badge */}
                          <StatusBadge
                            status={statusText}
                            hasUpcoming={hasUpcoming}
                          />
                        </div>
                        {s.overview && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {s.overview}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Season Checkboxes */}
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {renderWatchedSeasons(s.watchedSeasons, seriesIndex)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 max-w-[200px]">
                      <ProgressBar
                        width={`${s.watchProgress}%`}
                        size="md"
                        showPercentage={true}
                      >
                        {formatProgress(s.watchProgress)}%
                      </ProgressBar>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col items-center justify-center gap-1 p-3 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800">
                    <Link
                      href={`/dashboard/tvSeries/${s.id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onEditSeries?.(s)}
                      className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                      title="Edit Series"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSeries(s.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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
