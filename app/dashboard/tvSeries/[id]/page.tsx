// app/dashboard/tvSeries/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getUserSeries,
  updateWatchProgress,
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
} from "@/app/lib/series";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  CalendarIcon,
  TvIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import ProgressBar from "@/app/ui/tvSeries/progress-bar";
import Link from "next/link";
import EditSeriesForm from "@/app/ui/tvSeries/edit-series-form";
import Image from "next/image";

interface Series {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchedSeasons: boolean[];
  watchProgress: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string | null;
  voteAverage?: number;
  firstAirDate?: string | null;
  genres?: string[];
}

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);

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

  const handleEditSeries = async (
    id: string,
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
  ) => {
    if (!series) return;

    const updatedSeriesObj = {
      ...series,
      name,
      totalSeasons,
      upcomingSeasons,
    };

    try {
      const result = await updateSeriesAction(updatedSeriesObj);
      if (result.success) {
        setSeries(updatedSeriesObj);
        setIsEditing(false);
      } else {
        console.error("Failed to edit series:", result.error);
      }
    } catch (err) {
      console.error("Error editing series:", err);
    }
  };

  const handleDeleteSeries = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this series? This action cannot be undone.",
      )
    )
      return;

    setIsDeleting(true);
    try {
      const result = await deleteSeriesAction(series!.id);
      if (result.success) {
        router.push("/dashboard/tvSeries");
      } else {
        console.error("Failed to delete series:", result.error);
      }
    } catch (err) {
      console.error("Error deleting series:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getBackdropUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/original${path}`;
  };

  const getPosterUrl = (
    path: string | null | undefined,
    size: string = "w342",
  ) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getUpcomingText = () => {
    if (!series) return "";
    if (series.upcomingSeasons.length === 0) return "Series Ended";
    return `${series.upcomingSeasons[0].replace("Season", "S")} coming soon`;
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

  const backdropUrl = getBackdropUrl(series.backdropPath);
  const posterUrl = getPosterUrl(series.posterPath, "w300");
  const overviewText = series.overview || "No overview available.";
  const shouldTruncate = overviewText.length > 400;
  const displayOverview =
    showFullOverview || !shouldTruncate
      ? overviewText
      : overviewText.substring(0, 400) + "...";

  return (
    <div className="space-y-6">
      {/* Header with Navigation and Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleDeleteSeries}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Edit Series
              </h2>
              <EditSeriesForm
                series={series}
                onSave={handleEditSeries}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Backdrop */}
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        {backdropUrl ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <Image
              src={backdropUrl}
              alt={series.name}
              width={1920}
              height={400}
              className="h-64 w-full object-cover lg:h-80"
              priority
            />
          </>
        ) : (
          <div className="h-64 w-full bg-gradient-to-r from-blue-500 to-purple-600 lg:h-80" />
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            {posterUrl && (
              <Image
                src={posterUrl}
                alt={series.name}
                width={150}
                height={225}
                className="hidden h-36 w-24 rounded-lg shadow-lg object-cover ring-4 ring-white/20 sm:block"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
                {series.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm">
                  <TvIcon className="h-4 w-4" />
                  {series.totalSeasons}{" "}
                  {series.totalSeasons === 1 ? "Season" : "Seasons"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm">
                  <ClockIcon className="h-4 w-4" />
                  {getUpcomingText()}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm">
                  <CheckIcon className="h-4 w-4" />
                  {Math.round(series.watchProgress)}% Watched
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section - Moved up for better visibility */}
      {series.overview && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
            Overview
          </h2>
          <p className="leading-relaxed text-gray-600 dark:text-gray-400">
            {displayOverview}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullOverview(!showFullOverview)}
              className="mt-2 text-sm text-blue-500 hover:text-blue-600"
            >
              {showFullOverview ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Quick Info Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <TvIcon className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium text-gray-700 dark:text-gray-300">
              Total Seasons
            </h3>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {series.totalSeasons}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <CheckIcon className="h-5 w-5 text-green-500" />
            <h3 className="font-medium text-gray-700 dark:text-gray-300">
              Seasons Watched
            </h3>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {series.watchedSeasons.filter(Boolean).length} /{" "}
            {series.totalSeasons}
          </p>
        </div>
      </div>

      {/* Seasons Section */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Seasons
          </h2>
          <div className="h-2 flex-1 mx-4 rounded-full bg-gray-200 dark:bg-gray-700 max-w-[200px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
              style={{ width: `${series.watchProgress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {series.watchedSeasons.filter(Boolean).length}/{series.totalSeasons}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {series.watchedSeasons.map((watched, index) => (
            <button
              key={index}
              onClick={() => toggleSeason(index)}
              className={`group flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                watched
                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <span className="font-medium">Season {index + 1}</span>
              {watched ? (
                <CheckIcon className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
