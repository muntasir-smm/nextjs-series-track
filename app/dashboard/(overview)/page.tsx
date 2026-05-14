// app/dashboard/(overview)/page.tsx

"use client";

import { lusitana } from "@/app/ui/fonts";
import { useEffect, useState } from "react";
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

  // Load series from database on mount and after updates
  const loadSeries = async () => {
    try {
      setIsLoading(true);
      const series = await getUserSeries();
      setSeriesData(series);
    } catch (error) {
      console.error("Error loading series:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const updateSeries = async (updatedSeries: any[]) => {
    try {
      for (const series of updatedSeries) {
        await updateSeriesAction(series);
      }
      setSeriesData(updatedSeries);
      // Reload to ensure sync
      await loadSeries();
    } catch (error) {
      console.error("Error updating series:", error);
    }
  };

  const deleteSeries = async (id: string) => {
    try {
      await deleteSeriesAction(id);
      await loadSeries(); // Reload after deletion
    } catch (error) {
      console.error("Error deleting series:", error);
    }
  };

  // Calculate stats from database data
  const totalSeries = seriesData.length;
  const totalSeasons = seriesData.reduce(
    (acc, series) => acc + (series.totalSeasons || 0),
    0,
  );
  const totalWatchedSeasons = seriesData.reduce(
    (acc, series) => acc + (series.watchedSeasons?.filter(Boolean).length || 0),
    0,
  );
  const overallProgress =
    totalSeasons > 0
      ? Math.round((totalWatchedSeasons / totalSeasons) * 100)
      : 0;
  const recentlyAdded = [...seriesData]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

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

      {/* Stats Cards - Now showing real progress */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Series
          </h3>
          <p className="text-2xl font-bold text-blue-600">{totalSeries}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Seasons
          </h3>
          <p className="text-2xl font-bold text-blue-600">{totalSeasons}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Seasons Watched
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {totalWatchedSeasons}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Overall Progress
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {overallProgress}%
          </p>
        </div>
      </div>

      {/* Series List - Shows recent series with their watch progress */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recently Added Series
          </h2>
        </div>
        <div className="p-4">
          {recentlyAdded.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No series added yet. Go to the TV Series page to add your first
                series!
              </p>
            </div>
          ) : (
            <SeriesList
              series={recentlyAdded}
              updateSeries={updateSeries}
              deleteSeries={deleteSeries}
            />
          )}
        </div>
      </div>
    </main>
  );
}
