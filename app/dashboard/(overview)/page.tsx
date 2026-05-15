// app/dashboard/(overview)/page.tsx

"use client";

import { lusitana } from "@/app/ui/fonts";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserSeries, addSeries as addSeriesAction } from "@/app/lib/series";
import Link from "next/link";
import {
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import AddSeriesForm from "@/app/ui/tvSeries/add-series-form";

interface SuggestedSeries {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchProgress: number;
}

export default function Page() {
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [suggestedSeries, setSuggestedSeries] = useState<SuggestedSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addingSeriesId, setAddingSeriesId] = useState<string | null>(null);

  const loadSeries = useCallback(async () => {
    try {
      setIsLoading(true);
      const series = await getUserSeries();
      setSeriesData(series);
    } catch (error) {
      console.error("Error loading series:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeries();
    // Load suggested series for discovery section
    fetch("/api/suggested-series")
      .then((res) => res.json())
      .then(setSuggestedSeries)
      .catch(console.error);
  }, [loadSeries]);

  const handleAddSeries = useCallback(
    async (name: string, totalSeasons: number, upcomingSeasons: string[]) => {
      setIsAdding(true);
      try {
        const result = await addSeriesAction(
          name,
          totalSeasons,
          upcomingSeasons,
        );
        if (result.success) {
          await loadSeries();
          setIsModalOpen(false);
        } else {
          console.error("Failed to add series:", result.error);
        }
      } catch (error) {
        console.error("Error adding series:", error);
      } finally {
        setIsAdding(false);
      }
    },
    [loadSeries],
  );

  const handleAddSuggestedSeries = useCallback(
    async (series: SuggestedSeries) => {
      setAddingSeriesId(series.id);
      try {
        const result = await addSeriesAction(
          series.name,
          series.totalSeasons,
          series.upcomingSeasons,
        );
        if (result.success) {
          await loadSeries();
        } else {
          console.error("Failed to add series:", result.error);
        }
      } catch (error) {
        console.error("Error adding series:", error);
      } finally {
        setAddingSeriesId(null);
      }
    },
    [loadSeries],
  );

  // Get series IDs that user already has
  const userSeriesIds = useMemo(() => {
    return new Set(seriesData.map((s) => s.id));
  }, [seriesData]);

  // Filter out series that user already has
  const undiscoveredSeries = useMemo(() => {
    return suggestedSeries.filter((s) => !userSeriesIds.has(s.id));
  }, [suggestedSeries, userSeriesIds]);

  // Memoized stats calculations
  const stats = useMemo(() => {
    const totalSeries = seriesData.length;
    const totalSeasons = seriesData.reduce(
      (acc, series) => acc + (series.totalSeasons || 0),
      0,
    );
    const totalWatchedSeasons = seriesData.reduce(
      (acc, series) =>
        acc + (series.watchedSeasons?.filter(Boolean).length || 0),
      0,
    );
    const overallProgress =
      totalSeasons > 0
        ? Math.round((totalWatchedSeasons / totalSeasons) * 100)
        : 0;
    const recentlyAdded = [...seriesData]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 5);

    return {
      totalSeries,
      totalSeasons,
      totalWatchedSeasons,
      overallProgress,
      recentlyAdded,
    };
  }, [seriesData]);

  const getUpcomingText = useCallback(
    (upcomingSeasons: string[], totalSeasons: number) => {
      if (!upcomingSeasons || upcomingSeasons.length === 0) {
        return { show: true, text: "Series Ended", isUpcoming: false };
      }

      const upcomingSeason = upcomingSeasons[0];
      const seasonNum = parseInt(upcomingSeason.match(/\d+/)?.[0] || "0");

      if (seasonNum > totalSeasons) {
        return {
          show: true,
          text: `${upcomingSeason.replace("Season", "S")} coming soon`,
          isUpcoming: true,
        };
      }

      return { show: true, text: "Series Ended", isUpcoming: false };
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      {/* Add Series Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              disabled={isAdding}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Add New Series
              </h2>
              <AddSeriesForm
                addSeries={handleAddSeries}
                isSubmitting={isAdding}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1
          className={`${lusitana.className} mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl`}
        >
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Welcome to your series tracker
        </p>
      </div>

      {/* Stats Cards - Always show */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Series
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalSeries}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Seasons
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalSeasons}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Seasons Watched
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalWatchedSeasons}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Overall Progress
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {stats.overallProgress}%
          </p>
        </div>
      </div>

      {/* Your Series Section */}
      {stats.recentlyAdded.length > 0 && (
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Series
              </h2>
              <Link
                href="/dashboard/tvSeries"
                className="flex items-center gap-1 text-sm text-blue-500 transition-colors hover:text-blue-600"
              >
                View All ({stats.totalSeries})
                <PlusIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-4">
            <div className="grid gap-3">
              {stats.recentlyAdded.map((series) => {
                const upcomingInfo = getUpcomingText(
                  series.upcomingSeasons,
                  series.totalSeasons,
                );
                return (
                  <div
                    key={series.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {series.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{series.totalSeasons} seasons</span>
                        <div className="flex items-center gap-2">
                          <span>Progress:</span>
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                              style={{ width: `${series.watchProgress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {Math.round(series.watchProgress)}%
                          </span>
                        </div>
                      </div>
                      {upcomingInfo.show && (
                        <p
                          className={`mt-1 text-xs ${upcomingInfo.isUpcoming ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          {upcomingInfo.text}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/tvSeries/${series.id}`}
                      className="ml-4 inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      aria-label="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Details
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Discover More Section - Always show if there are undiscovered series */}
      {undiscoveredSeries.length > 0 && (
        <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Discover More Series
              </h2>
            </div>
            <Link
              href="/dashboard/discover"
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              View All →
            </Link>
          </div>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Popular series you might enjoy. Add them to your collection!
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {undiscoveredSeries.slice(0, 6).map((series) => (
              <div
                key={series.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {series.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {series.totalSeasons} seasons
                  </p>
                </div>
                <button
                  onClick={() => handleAddSuggestedSeries(series)}
                  disabled={addingSeriesId === series.id}
                  className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
                >
                  {addingSeriesId === series.id ? (
                    <ArrowPathIcon className="h-3 w-3 animate-spin" />
                  ) : (
                    <PlusIcon className="h-3 w-3" />
                  )}
                  Add
                </button>
              </div>
            ))}
          </div>
          {undiscoveredSeries.length > 6 && (
            <div className="mt-4 text-center">
              <Link
                href="/dashboard/discover"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                And {undiscoveredSeries.length - 6} more...
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Action Card */}
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg transition-all hover:shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-semibold">
              {stats.totalSeries === 0
                ? "Start Your Collection"
                : "Add More Series"}
            </h3>
            <p className="mt-1 text-blue-100">
              {stats.totalSeries === 0
                ? "Discover popular series or add your own"
                : "Find your next favorite show"}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-white px-6 py-2 font-medium text-blue-600 transition-all hover:bg-blue-50 hover:shadow-md"
          >
            Add Series
          </button>
        </div>
      </div>
    </main>
  );
}
