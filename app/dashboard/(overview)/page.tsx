// app/dashboard/(overview)/page.tsx

// Dashboard - after login

"use client";

import { lusitana } from "@/app/ui/fonts";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserSeries, addSeries as addSeriesAction } from "@/app/lib/series";
import Link from "next/link";
import { PlusIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
import AddSeriesForm from "@/app/ui/tvSeries/add-series-form";

export default function Page() {
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleAddSeries = async (
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
  ) => {
    try {
      const result = await addSeriesAction(name, totalSeasons, upcomingSeasons);
      if (result.success) {
        await loadSeries(); // Reload to show new series
        setIsModalOpen(false); // Close modal on success
      } else {
        console.error("Failed to add series:", result.error);
      }
    } catch (error) {
      console.error("Error adding series:", error);
    }
  };

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
      {/* Add Series Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Add New Series
              </h2>
              <AddSeriesForm addSeries={handleAddSeries} />
            </div>
          </div>
        </div>
      )}

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

      {/* Recently Added Section */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recently Added Series
            </h2>
            <Link
              href="/dashboard/tvSeries"
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
            >
              View All
              <PlusIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-4">
          {stats.recentlyAdded.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No series added yet. Add your first series!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stats.recentlyAdded.map((series) => (
                <div
                  key={series.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {series.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{series.totalSeasons} seasons</span>
                      <div className="flex items-center gap-2">
                        <span>Progress:</span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                            style={{ width: `${series.watchProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {Math.round(series.watchProgress)}%
                        </span>
                      </div>
                    </div>
                    {series.upcomingSeasons &&
                      series.upcomingSeasons.length > 0 && (
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                          {series.upcomingSeasons[0].replace("Season", "S")}{" "}
                          coming soon
                        </p>
                      )}
                  </div>
                  <Link
                    href={`/dashboard/tvSeries/${series.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    aria-label="View details"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Card */}
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Ready to add more?</h3>
            <p className="mt-1 text-blue-100">
              Track your next favorite series
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-white px-6 py-2 text-blue-600 transition-all hover:bg-blue-50"
          >
            Add Series
          </button>
        </div>
      </div>
    </main>
  );
}
