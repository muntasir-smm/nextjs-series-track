// app/dashboard/(overview)/page.tsx

import { lusitana } from "@/app/ui/fonts";
import SeriesListClient from "@/app/ui/tvSeries/series-list-client";
import SeriesData from "@/app/lib/series-data";
import { Suspense } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const seriesData = SeriesData; // Direct import since it's static

  // Calculate some stats
  const totalSeries = seriesData.length;
  const totalEpisodes = seriesData.reduce(
    (acc, series) => acc + (series.episodes?.length || 0),
    0,
  );
  const recentlyAdded = seriesData.slice(0, 5);

  return (
    <main className="space-y-6">
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Series
          </h3>
          <p className="text-2xl font-bold text-blue-600">{totalSeries}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Episodes
          </h3>
          <p className="text-2xl font-bold text-blue-600">{totalEpisodes}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Recently Added
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {recentlyAdded.length}
          </p>
        </div>
      </div>

      {/* Series List */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Series
          </h2>
        </div>
        <div className="p-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <ClockIcon className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading series...</span>
              </div>
            }
          >
            <SeriesListClient series={seriesData} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
