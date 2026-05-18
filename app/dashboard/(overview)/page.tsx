// app/dashboard/(overview)/page.tsx

"use client";

import { lusitana } from "@/app/ui/fonts";
import { useEffect, useState, useCallback, useMemo } from "react";
import Avatar from "@/app/ui/dashboard/avatar";
import { getUserSeries } from "@/app/lib/series";
import Link from "next/link";
import {
  PlusIcon,
  EyeIcon,
  SparklesIcon,
  ArrowPathIcon,
  TvIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { addSeries as addSeriesAction } from "@/app/lib/series";

interface SuggestedSeries {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchProgress: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string | null;
  voteAverage?: number;
}

export default function Page() {
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [suggestedSeries, setSuggestedSeries] = useState<SuggestedSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingSeriesId, setAddingSeriesId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        if (response.ok) {
          setUserName(data.name || "User");
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

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
    const loadPopularSeries = async () => {
      try {
        const response = await fetch("/api/tmdb/popular?page=1&limit=9");
        const data = await response.json();
        setSuggestedSeries(data.series || []);
      } catch (error) {
        console.error("Error loading popular series:", error);
      }
    };
    loadPopularSeries();
  }, [loadSeries]);

  useEffect(() => {
    const handleSeriesAdded = async () => {
      await loadSeries();
      const response = await fetch("/api/tmdb/popular?page=1&limit=9");
      const data = await response.json();
      setSuggestedSeries(data.series || []);
    };
    window.addEventListener("series-added", handleSeriesAdded);
    return () => window.removeEventListener("series-added", handleSeriesAdded);
  }, [loadSeries]);

  const handleAddSuggestedSeries = useCallback(
    async (series: SuggestedSeries) => {
      setAddingSeriesId(series.id);
      try {
        const result = await addSeriesAction(
          series.name,
          series.totalSeasons,
          [],
          series.posterPath,
          series.backdropPath,
          series.overview,
        );
        if (result.success) {
          await loadSeries();
          const response = await fetch("/api/tmdb/popular?page=1&limit=9");
          const data = await response.json();
          setSuggestedSeries(data.series || []);
        }
      } catch (error) {
        console.error("Error adding series:", error);
      } finally {
        setAddingSeriesId(null);
      }
    },
    [loadSeries],
  );

  const userSeriesIds = useMemo(() => {
    return new Set(seriesData.map((s) => s.id));
  }, [seriesData]);

  const undiscoveredSeries = useMemo(() => {
    return suggestedSeries.filter((s) => !userSeriesIds.has(s.id));
  }, [suggestedSeries, userSeriesIds]);

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
    const completedSeries = seriesData.filter(
      (s) => s.watchProgress === 100,
    ).length;
    const completedSeasons = seriesData.reduce(
      (acc, series) =>
        acc + (series.watchedSeasons?.filter(Boolean).length || 0),
      0,
    );

    return {
      totalSeries,
      totalSeasons,
      totalWatchedSeasons,
      overallProgress,
      recentlyAdded,
      completedSeries,
      completedSeasons,
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

  const getPosterUrl = (
    posterPath: string | null | undefined,
    size: string = "w92",
  ) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

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

  const hasSeries = stats.totalSeries > 0;

  return (
    <main className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-white/20 to-white/10 p-1.5 backdrop-blur-sm">
                <Avatar
                  src={avatarUrl}
                  name={userName || "User"}
                  size="xl"
                  shape="rounded"
                  className="h-20 w-20 md:h-24 md:w-24"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1.5 ring-2 ring-white">
                <CheckCircleIcon className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">{greeting}</p>
              <h1 className="text-2xl font-bold mt-0.5 md:text-3xl">
                {userName || "User"}! 👋
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {stats.totalSeries}{" "}
                {stats.totalSeries === 1 ? "series" : "series"} •{" "}
                {stats.overallProgress}% complete
              </p>
            </div>
          </div>

          {/* Achievement Badge */}
          {stats.completedSeries >= 5 && (
            <div className="flex items-center gap-2 rounded-full bg-yellow-500/30 backdrop-blur-sm px-3 py-1.5 text-sm">
              <span className="text-lg">🏆</span>
              <span>Series Master</span>
            </div>
          )}
          {stats.completedSeries >= 1 && stats.completedSeries < 5 && (
            <div className="flex items-center gap-2 rounded-full bg-blue-500/30 backdrop-blur-sm px-3 py-1.5 text-sm">
              <span className="text-lg">⭐</span>
              <span>{5 - stats.completedSeries} to Master</span>
            </div>
          )}
          {stats.completedSeries === 0 && (
            <div className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-sm">
              <span className="text-lg">🎯</span>
              <span>Complete first series</span>
            </div>
          )}
        </div>
      </div>

      {/* 6 Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {/* Total Series */}
        <div className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Series
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalSeries}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <TvIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Completed Series */}
        <div className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.completedSeries}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Seasons */}
        <div className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Seasons
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalSeasons}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
              <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Watched Seasons */}
        <div className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Watched
              </p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                {stats.totalWatchedSeasons}
              </p>
            </div>
            <div className="rounded-full bg-teal-100 p-2 dark:bg-teal-900/30">
              <CheckCircleIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>

        {/* Remaining Seasons */}
        <div className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Remaining
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {stats.totalSeasons - stats.totalWatchedSeasons}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
              <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Progress
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats.overallProgress}%
              </p>
            </div>
            <div className="relative h-10 w-10">
              <svg className="h-10 w-10 -rotate-90 transform">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${stats.overallProgress * 1.005} 100.5`}
                  className="text-blue-600 transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {stats.overallProgress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Series Section */}
      {hasSeries && (
        <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
          <div className="border-b border-gray-200 p-5 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recently Added
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Your latest additions
                </p>
              </div>
              <Link
                href="/dashboard/tvSeries"
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50"
              >
                View All <PlusIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats.recentlyAdded.map((series) => {
              const upcomingInfo = getUpcomingText(
                series.upcomingSeasons,
                series.totalSeasons,
              );
              const posterUrl = getPosterUrl(series.posterPath);
              return (
                <div
                  key={series.id}
                  className="flex items-center gap-4 p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {posterUrl && (
                    <img
                      src={posterUrl}
                      alt={series.name}
                      className="h-12 w-8 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {series.name}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{series.totalSeasons} seasons</span>
                      <div className="flex items-center gap-1">
                        <span>Progress:</span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${series.watchProgress}%` }}
                          />
                        </div>
                        <span>{Math.round(series.watchProgress)}%</span>
                      </div>
                    </div>
                    {upcomingInfo.show && (
                      <p
                        className={`mt-0.5 text-xs ${upcomingInfo.isUpcoming ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`}
                      >
                        {upcomingInfo.text}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/tvSeries/${series.id}`}
                    className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-blue-600"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Now Section */}
      {undiscoveredSeries.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FireIcon className="h-6 w-6 text-orange-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Trending Now
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  What people are watching
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/discover"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {undiscoveredSeries.slice(0, 12).map((series) => (
              <div
                key={series.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getPosterUrl(series.posterPath, "w92") && (
                    <img
                      src={getPosterUrl(series.posterPath, "w92")!}
                      alt={series.name}
                      className="h-12 w-8 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {series.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{series.totalSeasons || "?"} seasons</span>
                      {series.voteAverage && series.voteAverage > 0 && (
                        <span className="flex items-center gap-0.5">
                          <StarIcon className="h-3 w-3 text-yellow-500" />
                          {series.voteAverage.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
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
        </div>
      )}

      {/* Empty State */}
      {!hasSeries && (
        <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 p-12 text-center dark:from-purple-900/20 dark:to-blue-900/20">
          <TvIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Your watchlist is empty
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Start tracking your favorite TV series today!
          </p>
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-add-modal"))
            }
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5" />
            Add Your First Series
          </button>
        </div>
      )}
    </main>
  );
}
