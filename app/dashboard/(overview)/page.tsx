// app/dashboard/(overview)/page.tsx

"use client";

import { lusitana } from "@/app/ui/fonts";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { getUserSeries } from "@/app/lib/series";
import SeriesList from "@/app/ui/tvSeries/series-list";
import {
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
} from "@/app/lib/series";

export default function Page() {
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [loadSeries]);

  const updateSeries = useCallback(
    async (updatedSeries: any[]) => {
      // Update UI immediately
      setSeriesData(updatedSeries);

      // Save to database in background
      try {
        for (const series of updatedSeries) {
          await updateSeriesAction(series);
        }
      } catch (error) {
        console.error("Error updating series:", error);
        // Reload to ensure sync if error
        await loadSeries();
      }
    },
    [loadSeries],
  );

  const deleteSeries = useCallback(
    async (id: string) => {
      // Update UI immediately
      setSeriesData((prev) => prev.filter((s) => s.id !== id));

      // Save to database in background
      try {
        await deleteSeriesAction(id);
      } catch (error) {
        console.error("Error deleting series:", error);
        // Reload to ensure sync if error
        await loadSeries();
      }
    },
    [loadSeries],
  );

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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Series
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalSeries}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Seasons
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalSeasons}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Seasons Watched
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalWatchedSeasons}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Overall Progress
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {stats.overallProgress}%
          </p>
        </div>
      </div>

      {/* Series List */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg text-center font-semibold text-gray-900 dark:text-white">
            Recently Added Series
          </h2>
        </div>
        <div className="p-4">
          {stats.recentlyAdded.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No series added yet. Go to the TV Series page to add your first
                series!
              </p>
            </div>
          ) : (
            <SeriesList
              series={stats.recentlyAdded}
              updateSeries={updateSeries}
              deleteSeries={deleteSeries}
            />
          )}
        </div>
      </div>
    </main>
  );
}
