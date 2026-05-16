// app/ui/tvSeries/series-list.tsx

"use client";
import React, { useState, useEffect } from "react";
import ProgressBar from "./progress-bar";
import { TrashIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { updateWatchProgress } from "@/app/lib/series";
import Link from "next/link";
import Image from "next/image";

// Helper function to get poster URL
const getPosterUrl = (
  posterPath: string | null | undefined,
  size: string = "w185",
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
  posterPath?: string | null;
  overview?: string | null;
}

interface SeriesListProps {
  series: Series[] | undefined;
  updateSeries: (updatedSeries: Series[]) => void;
  deleteSeries: (id: string) => void;
  onEditSeries?: (series: Series) => void;
}

const SeriesList: React.FC<SeriesListProps> = ({
  series,
  updateSeries,
  deleteSeries,
  onEditSeries,
}) => {
  const [localSeries, setLocalSeries] = useState<Series[] | undefined>(series);

  useEffect(() => {
    setLocalSeries(series);
  }, [series]);

  const formatProgress = (progress: number): string => {
    return Math.round(progress).toString();
  };

  const toggleWatched = (seriesIndex: number, seasonIndex: number) => {
    if (!localSeries) return;

    const updatedSeries = [...localSeries];
    updatedSeries[seriesIndex].watchedSeasons[seasonIndex] =
      !updatedSeries[seriesIndex].watchedSeasons[seasonIndex];
    updatedSeries[seriesIndex].watchProgress = calculateProgress(
      updatedSeries[seriesIndex].watchedSeasons,
    );

    setLocalSeries(updatedSeries);

    const currentSeries = updatedSeries[seriesIndex];
    updateWatchProgress(currentSeries.id, currentSeries.watchedSeasons).catch(
      console.error,
    );
  };

  const calculateProgress = (watchedSeasons: boolean[]): number => {
    const watchedCount = watchedSeasons.filter(Boolean).length;
    return Math.round((watchedCount / watchedSeasons.length) * 100);
  };

  const renderWatchedSeasons = (
    watchedSeasons: boolean[],
    seriesIndex: number,
  ) => {
    return watchedSeasons.map((watched, seasonIndex) => (
      <label
        key={seasonIndex}
        className="inline-flex items-center gap-1 text-xs cursor-pointer hover:text-blue-600 transition-colors"
      >
        <input
          type="checkbox"
          checked={watched}
          onChange={() => toggleWatched(seriesIndex, seasonIndex)}
          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
        />
        <span>S{seasonIndex + 1}</span>
      </label>
    ));
  };

  const renderUpcomingSeasons = (
    upcomingSeasons: string[],
    totalSeasons: number,
  ): string => {
    if (!upcomingSeasons || upcomingSeasons.length === 0) {
      return "Series Ended";
    }

    const nextSeasonNumber = totalSeasons + 1;
    const expectedNextSeason = `Season ${nextSeasonNumber}`;

    if (upcomingSeasons.includes(expectedNextSeason)) {
      const seasonNum = nextSeasonNumber.toString().padStart(2, "0");
      return `S${seasonNum}`;
    }

    const firstUpcoming = upcomingSeasons[0];
    const seasonNumber = firstUpcoming.match(/\d+/)?.[0];
    if (seasonNumber) {
      const paddedNum = seasonNumber.padStart(2, "0");
      return `S${paddedNum}`;
    }

    return firstUpcoming.replace("Season", "S");
  };

  // For mobile view, use cards instead of table
  if (localSeries && localSeries.length > 0) {
    return (
      <div className="space-y-4">
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden md:block w-full overflow-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Poster
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Total Seasons
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Upcoming
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Watched
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Progress
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {localSeries.map((s, seriesIndex) => {
                const posterUrl = getPosterUrl(s.posterPath);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt={s.name}
                          width={32}
                          height={48}
                          className="h-12 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {s.name}
                      {s.overview && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {s.overview.substring(0, 80)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {s.totalSeasons}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {renderUpcomingSeasons(s.upcomingSeasons, s.totalSeasons)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {renderWatchedSeasons(s.watchedSeasons, seriesIndex)}
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[100px]">
                      <ProgressBar width={`${s.watchProgress}%`}>
                        {formatProgress(s.watchProgress)}%
                      </ProgressBar>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/dashboard/tvSeries/${s.id}`}
                          className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-blue-600"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => onEditSeries?.(s)}
                          className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-amber-600"
                          title="Edit Series"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteSeries(s.id)}
                          className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-red-600"
                          title="Delete Series"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Visible only on mobile */}
        <div className="md:hidden space-y-3">
          {localSeries.map((s, seriesIndex) => {
            const posterUrl = getPosterUrl(s.posterPath);
            return (
              <div
                key={s.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex gap-3">
                  {/* Poster */}
                  <div className="flex-shrink-0">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={s.name}
                        width={48}
                        height={64}
                        className="h-16 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-16 w-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No img</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {s.name}
                    </h3>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {s.totalSeasons} seasons •{" "}
                      {renderUpcomingSeasons(s.upcomingSeasons, s.totalSeasons)}
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {renderWatchedSeasons(s.watchedSeasons, seriesIndex)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <ProgressBar width={`${s.watchProgress}%`}>
                        {formatProgress(s.watchProgress)}%
                      </ProgressBar>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/dashboard/tvSeries/${s.id}`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onEditSeries?.(s)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-amber-600"
                      title="Edit Series"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSeries(s.id)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                      title="Delete Series"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {s.overview && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {s.overview}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-gray-600 dark:text-gray-400">
        No series available. Add your first series above!
      </p>
    </div>
  );
};

export default SeriesList;
