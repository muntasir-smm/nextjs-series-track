// app/ui/tvSeries/series-list.tsx

"use client";
import React, { useState, useEffect } from "react";
import ProgressBar from "./progress-bar";
import { TrashIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { updateWatchProgress } from "@/app/lib/series";
import Link from "next/link";

interface Series {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchedSeasons: boolean[];
  watchProgress: number;
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
        S{seasonIndex + 1}
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

  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
              Total Seasons
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
              Upcoming Seasons
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
              Watched Seasons
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
          {localSeries && localSeries.length > 0 ? (
            localSeries.map((s, seriesIndex) => (
              <tr
                key={s.id}
                className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 group"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {s.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {s.totalSeasons}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {s.upcomingSeasons.length > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {renderUpcomingSeasons(s.upcomingSeasons, s.totalSeasons)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      Series Ended
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {renderWatchedSeasons(s.watchedSeasons, seriesIndex)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-[120px]">
                    <ProgressBar width={`${s.watchProgress}%`}>
                      {formatProgress(s.watchProgress)}%
                    </ProgressBar>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* View Details Button */}
                    <Link
                      href={`/dashboard/tvSeries/${s.id}`}
                      className="group/btn inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                      aria-label="View details"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEditSeries?.(s)}
                      className="group/btn inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-amber-400"
                      aria-label="Edit series"
                      title="Edit Series"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteSeries(s.id)}
                      className="group/btn inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
                      aria-label="Delete series"
                      title="Delete Series"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                No series available. Add your first series above!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SeriesList;
