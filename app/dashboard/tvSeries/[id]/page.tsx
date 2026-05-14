// app/dashboard/tvSeries/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserSeries, updateWatchProgress } from "@/app/lib/series";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ProgressBar from "@/app/ui/tvSeries/progress-bar";
import Link from "next/link";

interface Series {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchedSeasons: boolean[];
  watchProgress: number;
}

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const allSeries = await getUserSeries();
        const found = allSeries.find((s) => s.id === params.id);
        setSeries(found || null);
      } catch (error) {
        console.error("Error loading series:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSeries();
  }, [params.id]);

  const toggleSeason = async (seasonIndex: number) => {
    if (!series) return;

    const newWatchedSeasons = [...series.watchedSeasons];
    newWatchedSeasons[seasonIndex] = !newWatchedSeasons[seasonIndex];

    await updateWatchProgress(series.id, newWatchedSeasons);

    setSeries({
      ...series,
      watchedSeasons: newWatchedSeasons,
      watchProgress: Math.round(
        (newWatchedSeasons.filter(Boolean).length / series.totalSeasons) * 100,
      ),
    });
  };

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

  if (!series) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Series not found
        </h2>
        <Link
          href="/dashboard/tvSeries"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          Back to TV Series
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back
      </button>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {series.name}
        </h1>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Seasons
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {series.totalSeasons}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {series.upcomingSeasons.length > 0
                ? series.upcomingSeasons[0].replace("Season", "S")
                : "Series Ended"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Watch Progress
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(series.watchProgress)}%
            </p>
          </div>
          <ProgressBar size="lg" width={`${series.watchProgress}%`}>
            {Math.round(series.watchProgress)}%
          </ProgressBar>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Seasons
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {series.watchedSeasons.map((watched, index) => (
            <button
              key={index}
              onClick={() => toggleSeason(index)}
              className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                watched
                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <span className="font-medium">Season {index + 1}</span>
              {watched && <span className="text-green-500">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
