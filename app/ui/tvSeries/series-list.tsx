// app/ui/tvSeries/series-list.tsx

"use client";
import React, { useState, useEffect } from "react";
import ProgressBar from "./progress-bar";
import {
  TrashIcon,
  PencilIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
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
}

const SeriesList: React.FC<SeriesListProps> = ({
  series,
  updateSeries,
  deleteSeries,
  onEditSeries,
}) => {
  const [localSeries, setLocalSeries] = useState<Series[] | undefined>(series);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Load saved view preference
  useEffect(() => {
    const savedView = localStorage.getItem("seriesViewPreference");
    if (savedView === "table" || savedView === "grid") {
      setViewMode(savedView);
    }
  }, []);

  // Save view preference
  const handleViewChange = (mode: "table" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("seriesViewPreference", mode);
  };

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
    updateSeries(updatedSeries);

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
  ): { text: string; hasUpcoming: boolean } => {
    if (!upcomingSeasons || upcomingSeasons.length === 0) {
      return { text: "Series Ended", hasUpcoming: false };
    }

    const nextSeasonNumber = totalSeasons + 1;
    const expectedNextSeason = `Season ${nextSeasonNumber}`;

    if (upcomingSeasons.includes(expectedNextSeason)) {
      const seasonNum = nextSeasonNumber.toString().padStart(2, "0");
      return { text: `Upcoming S${seasonNum}`, hasUpcoming: true };
    }

    const firstUpcoming = upcomingSeasons[0];
    const seasonNumber = firstUpcoming.match(/\d+/)?.[0];
    if (seasonNumber) {
      const paddedNum = seasonNumber.padStart(2, "0");
      return { text: `Upcoming S${paddedNum}`, hasUpcoming: true };
    }

    return {
      text: firstUpcoming.replace("Season", "Upcoming S"),
      hasUpcoming: true,
    };
  };

  if (localSeries && localSeries.length > 0) {
    return (
      <div className="space-y-4">
        {/* View Toggle Buttons */}
        <div className="flex items-center justify-end">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
            <button
              onClick={() => handleViewChange("table")}
              className={`rounded-md p-2 transition-all ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400"
                  : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
              title="Table View"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleViewChange("grid")}
              className={`rounded-md p-2 transition-all ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400"
                  : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
              title="Grid View"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TABLE VIEW (Desktop & Mobile responsive) */}
        {viewMode === "table" && (
          <div className="w-full overflow-x-auto">
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
                    Status
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
                  const { text: statusText, hasUpcoming } =
                    renderUpcomingSeasons(s.upcomingSeasons, s.totalSeasons);
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
                            <span className="text-xs text-gray-400">
                              No img
                            </span>
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
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            hasUpcoming
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {statusText}
                        </span>
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
        )}

        {/* GRID VIEW - Works on all devices */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {localSeries.map((s) => {
              const posterUrl = getPosterUrl(s.posterPath, "w342");
              const { text: statusText, hasUpcoming } = renderUpcomingSeasons(
                s.upcomingSeasons,
                s.totalSeasons,
              );
              return (
                <div
                  key={s.id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-700">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={s.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2">
                      <ProgressBar width={`${s.watchProgress}%`}>
                        {formatProgress(s.watchProgress)}%
                      </ProgressBar>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                          hasUpcoming
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {statusText === "Series Ended" ? "Ended" : statusText}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/dashboard/tvSeries/${s.id}`}
                        className="rounded-full bg-white/20 p-2 text-white transition-all hover:bg-white/30"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => onEditSeries?.(s)}
                        className="rounded-full bg-white/20 p-2 text-white transition-all hover:bg-white/30"
                        title="Edit Series"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteSeries(s.id)}
                        className="rounded-full bg-white/20 p-2 text-red-300 transition-all hover:bg-white/30 hover:text-red-400"
                        title="Delete Series"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {s.name}
                    </h3>

                    {/* Overview in Grid */}
                    {s.overview && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {s.overview}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{s.totalSeasons} seasons</span>
                      <span>•</span>
                      <span
                        className={
                          hasUpcoming
                            ? "text-green-600 dark:text-green-400 font-medium"
                            : "text-red-600 dark:text-red-400 font-medium"
                        }
                      >
                        {statusText === "Series Ended" ? "Ended" : statusText}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
