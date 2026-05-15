// app/dashboard/discover/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { addSeries as addSeriesAction, getUserSeries } from "@/app/lib/series";
import Link from "next/link";

interface SuggestedSeries {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchProgress: number;
}

export default function DiscoverPage() {
  const [suggestedSeries, setSuggestedSeries] = useState<SuggestedSeries[]>([]);
  const [userSeriesIds, setUserSeriesIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [addingSeriesId, setAddingSeriesId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user's series
        const userSeries = await getUserSeries();
        setUserSeriesIds(new Set(userSeries.map((s) => s.id)));

        // Load suggested series
        const res = await fetch("/api/suggested-series");
        const data = await res.json();
        setSuggestedSeries(data);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddSeries = async (series: SuggestedSeries) => {
    setAddingSeriesId(series.id);
    try {
      const result = await addSeriesAction(
        series.name,
        series.totalSeasons,
        series.upcomingSeasons,
      );
      if (result.success) {
        // Add to user's collection
        setUserSeriesIds((prev) => new Set([...prev, series.id]));
      }
    } catch (error) {
      console.error("Error adding series:", error);
    } finally {
      setAddingSeriesId(null);
    }
  };

  const undiscoveredSeries = suggestedSeries.filter(
    (s) => !userSeriesIds.has(s.id),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Discover Series
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Explore popular series and add them to your collection
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {undiscoveredSeries.map((series) => (
          <div
            key={series.id}
            className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {series.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {series.totalSeasons} seasons
            </p>
            {series.upcomingSeasons && series.upcomingSeasons.length > 0 && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                {series.upcomingSeasons[0].replace("Season", "S")} coming soon
              </p>
            )}
            <button
              onClick={() => handleAddSeries(series)}
              disabled={addingSeriesId === series.id}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
            >
              {addingSeriesId === series.id ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              Add to My Series
            </button>
          </div>
        ))}
      </div>

      {undiscoveredSeries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            You&apos;ve discovered all series! Check back later for more.
          </p>
          <Link
            href="/dashboard/tvSeries"
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            View your collection →
          </Link>
        </div>
      )}
    </div>
  );
}
