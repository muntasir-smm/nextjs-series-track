// app/ui/tvSeries/series-list.tsx

"use client";
import React, { useState } from "react";
import ProgressBar from "./progress-bar";
import { TrashIcon } from "@heroicons/react/24/outline";
import { updateWatchProgress } from "@/app/lib/series";

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
}

const SeriesList: React.FC<SeriesListProps> = ({
  series,
  updateSeries,
  deleteSeries,
}) => {
  // Local state for instant UI updates
  const [localSeries, setLocalSeries] = useState<Series[] | undefined>(series);

  // Update local state when props change
  React.useEffect(() => {
    setLocalSeries(series);
  }, [series]);

  const formatProgress = (progress: number): string => {
    return Math.round(progress).toString();
  };

  const toggleWatched = (seriesIndex: number, seasonIndex: number) => {
    if (!localSeries) return;

    // Create updated series array
    const updatedSeries = [...localSeries];
    updatedSeries[seriesIndex].watchedSeasons[seasonIndex] =
      !updatedSeries[seriesIndex].watchedSeasons[seasonIndex];
    updatedSeries[seriesIndex].watchProgress = calculateProgress(
      updatedSeries[seriesIndex].watchedSeasons,
    );

    // Update UI instantly with local state
    setLocalSeries(updatedSeries);

    // Save to database in background
    const currentSeries = updatedSeries[seriesIndex];
    updateWatchProgress(currentSeries.id, currentSeries.watchedSeasons)
      .then(() => {
        // Only update parent after successful save (optional)
        updateSeries(updatedSeries);
      })
      .catch(console.error);
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
                className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {s.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {s.totalSeasons}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {renderUpcomingSeasons(s.upcomingSeasons, s.totalSeasons)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {renderWatchedSeasons(s.watchedSeasons, seriesIndex)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-[100px]">
                    <ProgressBar width={`${s.watchProgress}%`}>
                      {formatProgress(s.watchProgress)}%
                    </ProgressBar>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => deleteSeries(s.id)}
                    className="inline-flex items-center justify-center rounded-md bg-red-100 p-2 text-red-600 transition-all hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                    aria-label="Delete series"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
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
