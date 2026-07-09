// app/dashboard/tvSeries/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  TvIcon,
  ClockIcon,
  CalendarIcon,
  FilmIcon,
  GlobeAltIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import EditSeriesForm from "@/app/ui/tvSeries/edit-series-form";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
  voteCount?: number;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  genres?: string[];
  status?: string;
  tagline?: string;
  originalName?: string;
  originalLanguage?: string;
  popularity?: number;
  inProduction?: boolean;
  networks?: string[];
  totalEpisodes?: number;
  seasons?: {
    seasonNumber: number;
    episodeCount: number;
    airDate?: string;
    overview?: string;
    posterPath?: string | null;
  }[];
}

// Helper functions
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateProgress = (
  watchedSeasons: boolean[],
  totalSeasons: number,
): number => {
  if (totalSeasons === 0) return 0;
  return Math.round(
    (watchedSeasons.filter(Boolean).length / totalSeasons) * 100,
  );
};

const getGenreColor = (genre: string, isDark: boolean) => {
  const lightColors: Record<string, string> = {
    Action: "bg-red-100 text-red-800 border-red-200",
    Adventure: "bg-orange-100 text-orange-800 border-orange-200",
    Animation: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Comedy: "bg-green-100 text-green-800 border-green-200",
    Crime: "bg-gray-100 text-gray-800 border-gray-200",
    Documentary: "bg-blue-100 text-blue-800 border-blue-200",
    Drama: "bg-purple-100 text-purple-800 border-purple-200",
    Family: "bg-pink-100 text-pink-800 border-pink-200",
    Fantasy: "bg-indigo-100 text-indigo-800 border-indigo-200",
    History: "bg-amber-100 text-amber-800 border-amber-200",
    Horror: "bg-red-100 text-red-800 border-red-200",
    Music: "bg-purple-100 text-purple-800 border-purple-200",
    Mystery: "bg-slate-100 text-slate-800 border-slate-200",
    Romance: "bg-pink-100 text-pink-800 border-pink-200",
    "Sci-Fi": "bg-cyan-100 text-cyan-800 border-cyan-200",
    "Sci-Fi & Fantasy": "bg-cyan-100 text-cyan-800 border-cyan-200",
    Thriller: "bg-gray-100 text-gray-800 border-gray-200",
    War: "bg-rose-100 text-rose-800 border-rose-200",
    Western: "bg-amber-100 text-amber-800 border-amber-200",
  };

  const darkColors: Record<string, string> = {
    Action: "bg-red-950/50 text-red-300 border-red-800",
    Adventure: "bg-orange-950/50 text-orange-300 border-orange-800",
    Animation: "bg-yellow-950/50 text-yellow-300 border-yellow-800",
    Comedy: "bg-green-950/50 text-green-300 border-green-800",
    Crime: "bg-gray-800 text-gray-300 border-gray-700",
    Documentary: "bg-blue-950/50 text-blue-300 border-blue-800",
    Drama: "bg-purple-950/50 text-purple-300 border-purple-800",
    Family: "bg-pink-950/50 text-pink-300 border-pink-800",
    Fantasy: "bg-indigo-950/50 text-indigo-300 border-indigo-800",
    History: "bg-amber-950/50 text-amber-300 border-amber-800",
    Horror: "bg-red-950/50 text-red-300 border-red-800",
    Music: "bg-purple-950/50 text-purple-300 border-purple-800",
    Mystery: "bg-slate-800 text-slate-300 border-slate-700",
    Romance: "bg-pink-950/50 text-pink-300 border-pink-800",
    "Sci-Fi": "bg-cyan-950/50 text-cyan-300 border-cyan-800",
    "Sci-Fi & Fantasy": "bg-cyan-950/50 text-cyan-300 border-cyan-800",
    Thriller: "bg-gray-800 text-gray-300 border-gray-700",
    War: "bg-rose-950/50 text-rose-300 border-rose-800",
    Western: "bg-amber-950/50 text-amber-300 border-amber-800",
  };

  return isDark ? darkColors[genre] : lightColors[genre];
};

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [hasFetchedDetails, setHasFetchedDetails] = useState(false);

  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [updatingSeason, setUpdatingSeason] = useState<number | null>(null);

  // ✅ Safely get the series ID
  const seriesId = useMemo(() => {
    if (!params?.id) return undefined;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchTMDBDetails = useCallback(async (seriesName: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const searchResponse = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(seriesName)}`,
        { signal: controller.signal },
      );
      const searchData = await searchResponse.json();

      if (searchData.series?.length > 0 && !controller.signal.aborted) {
        const tmdbSeries = searchData.series[0];

        const detailsResponse = await fetch(`/api/tmdb/tv/${tmdbSeries.id}`, {
          signal: controller.signal,
        });
        const details = await detailsResponse.json();

        if (details && !controller.signal.aborted) {
          setSeries((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              voteAverage: details.voteAverage ?? prev.voteAverage,
              voteCount: details.voteCount ?? prev.voteCount,
              firstAirDate: details.firstAirDate ?? prev.firstAirDate,
              lastAirDate: details.lastAirDate ?? prev.lastAirDate,
              genres: details.genres ?? prev.genres,
              status: details.status ?? prev.status,
              tagline: details.tagline ?? prev.tagline,
              originalName: details.originalName ?? prev.originalName,
              originalLanguage:
                details.originalLanguage ?? prev.originalLanguage,
              popularity: details.popularity ?? prev.popularity,
              inProduction: details.inProduction ?? prev.inProduction,
              networks: details.networks ?? prev.networks,
              totalEpisodes: details.totalEpisodes ?? prev.totalEpisodes,
              seasons: details.seasons ?? prev.seasons,
            };
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching TMDB details:", error);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  const loadSeries = useCallback(async () => {
    // ✅ Check if seriesId exists before loading
    if (!seriesId) {
      setIsLoading(false);
      return;
    }

    try {
      const allSeries = await getUserSeries();
      const found = allSeries.find((s) => s.id === seriesId);

      if (found) {
        setSeries(found);

        // Only fetch TMDB details if not already fetched and missing data
        if (
          !hasFetchedDetails &&
          !found.voteAverage &&
          !found.genres?.length &&
          !found.firstAirDate
        ) {
          setHasFetchedDetails(true);
          await fetchTMDBDetails(found.name);
        }
      }
    } catch (error) {
      console.error("Error loading series:", error);
    } finally {
      setIsLoading(false);
    }
  }, [seriesId, fetchTMDBDetails, hasFetchedDetails]);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const toggleSeason = useCallback(
    async (seasonIndex: number) => {
      if (updatingSeason !== null) return;

      const currentSeries = series;
      if (!currentSeries) return;

      const newWatchedSeasons = [...currentSeries.watchedSeasons];
      newWatchedSeasons[seasonIndex] = !newWatchedSeasons[seasonIndex];
      const newProgress = calculateProgress(
        newWatchedSeasons,
        currentSeries.totalSeasons,
      );

      setUpdatingSeason(seasonIndex);
      setSeries({
        ...currentSeries,
        watchedSeasons: newWatchedSeasons,
        watchProgress: newProgress,
      });

      try {
        await updateWatchProgress(currentSeries.id, newWatchedSeasons);
      } catch (error) {
        console.error("Error updating season:", error);
        setSeries(currentSeries);
      } finally {
        setUpdatingSeason(null);
      }
    },
    [series, updatingSeason],
  );

  const handleEditSeries = useCallback(
    async (
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
        }
      } catch (err) {
        console.error("Error editing series:", err);
      }
    },
    [series],
  );

  const handleDeleteSeries = useCallback(async () => {
    // ✅ Check if seriesId exists before deleting
    if (!seriesId) {
      console.error("No series ID found");
      return;
    }

    if (!confirm("Delete this series?")) return;

    setIsDeleting(true);
    try {
      const result = await deleteSeriesAction(seriesId);
      if (result.success) {
        router.push("/dashboard/tvSeries");
      }
    } catch (err) {
      console.error("Error deleting series:", err);
    } finally {
      setIsDeleting(false);
    }
  }, [seriesId, router]);

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

  // ✅ If no seriesId, show error
  if (!seriesId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-6">
            <TvIcon className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Series ID not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The series ID is missing from the URL.
          </p>
          <Link
            href="/dashboard/tvSeries"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all shadow-lg"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to TV Series
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Loading series details...
          </p>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-6">
            <TvIcon className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Series not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The series you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/dashboard/tvSeries"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all shadow-lg"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to TV Series
          </Link>
        </div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(series.backdropPath);
  const posterUrl = getPosterUrl(series.posterPath, "w400");
  const overviewText = series.overview || "No overview available.";
  const shouldTruncate = overviewText.length > 400;
  const displayOverview =
    showFullOverview || !shouldTruncate
      ? overviewText
      : overviewText.substring(0, 400) + "...";

  const watchedCount = series.watchedSeasons.filter(Boolean).length;
  const upcomingText = getUpcomingText();
  const hasUpcoming = series.upcomingSeasons.length > 0;
  const firstAirYear = series.firstAirDate
    ? new Date(series.firstAirDate).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="relative h-[600px] md:h-[650px] overflow-hidden">
        {/* Backdrop Image */}
        {backdropUrl ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-900/50 to-transparent dark:from-gray-950 dark:via-black/70 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-transparent dark:from-gray-950 dark:via-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-l from-gray-50/50 via-transparent to-transparent dark:from-gray-950/50 dark:via-transparent z-10" />

            <Image
              src={backdropUrl}
              alt={series.name}
              fill
              className="object-cover"
              priority
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10">
          <div className="max-w-7xl mx-auto w-full">
            {/* Navigation - Fixed position to always be visible */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
              <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black/70 transition-all shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-white/10 backdrop-blur-md rounded-full text-gray-900 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-all shadow-lg border border-gray-200 dark:border-white/20"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    Edit
                  </span>
                </button>
                <button
                  onClick={handleDeleteSeries}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/90 dark:bg-red-500/20 backdrop-blur-md rounded-full text-white dark:text-red-200 hover:bg-red-600 dark:hover:bg-red-500/30 transition-all shadow-lg border border-red-400 dark:border-red-500/30 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {isDeleting ? "Deleting..." : "Delete"}
                  </span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-row gap-6 items-end">
              {/* Poster */}
              {posterUrl && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="hidden sm:block w-56 flex-shrink-0 relative z-30"
                >
                  <div className="relative rounded-xl overflow-hidden shadow-2xl">
                    <Image
                      src={posterUrl}
                      alt={series.name}
                      width={300}
                      height={450}
                      className="w-full h-auto"
                    />
                  </div>
                </motion.div>
              )}

              {/* Title & Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 pb-6"
              >
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white drop-shadow-lg leading-tight">
                    {series.name}
                  </h1>

                  {series.tagline && (
                    <p className="text-lg text-gray-700 dark:text-gray-300 italic">
                      {series.tagline}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                      TV Series
                    </span>
                    {firstAirYear && (
                      <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        {firstAirYear}
                      </span>
                    )}
                    {series.status && (
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          series.status === "Returning Series" ||
                          series.inProduction
                            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                            : series.status === "Ended"
                              ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                              : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                        }`}
                      >
                        {series.status}
                      </span>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <TvIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Seasons
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {series.totalSeasons}
                        </div>
                      </div>
                    </div>

                    {series.totalEpisodes && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <FilmIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Episodes
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {series.totalEpisodes}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                        <ClockIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Upcoming
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {hasUpcoming ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>

                    {series.voteAverage && series.voteAverage > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                          <StarSolidIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Rating
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {series.voteAverage.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {series.genres && series.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                      {series.genres.map((genre) => (
                        <span
                          key={genre}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getGenreColor(genre, isDark)}`}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="max-w-md">
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <span>Watch Progress</span>
                      <span className="font-semibold">
                        {series.watchProgress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${series.watchProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {watchedCount} of {series.totalSeasons} seasons watched
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-12 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Synopsis
                  </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {displayOverview}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => setShowFullOverview(!showFullOverview)}
                    className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {showFullOverview ? "Show less" : "Read more"}
                  </button>
                )}
              </motion.div>

              {/* Seasons Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <TvIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Seasons
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {series.watchedSeasons.map((watched, index) => (
                    <button
                      key={index}
                      onClick={() => toggleSeason(index)}
                      disabled={updatingSeason === index}
                      className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                        watched
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700"
                          : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                      } ${updatingSeason === index ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          Season {index + 1}
                        </div>
                        {watched ? (
                          <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckIcon className="h-4 w-4" />
                            <span className="text-xs">Watched</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Not watched
                          </div>
                        )}
                      </div>
                      {updatingSeason === index && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Original Info */}
              {(series.originalLanguage || series.originalName) && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                    Original Info
                  </h3>
                  <div className="space-y-3">
                    {series.originalName &&
                      series.originalName !== series.name && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Original Name
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {series.originalName}
                          </div>
                        </div>
                      )}
                    {series.originalLanguage && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Original Language
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white uppercase">
                          {series.originalLanguage}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Release Info */}
              {(series.firstAirDate || series.lastAirDate) && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    Release Info
                  </h3>
                  <div className="space-y-3">
                    {series.firstAirDate && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          First Air Date
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(series.firstAirDate)}
                        </div>
                      </div>
                    )}
                    {series.lastAirDate && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Last Air Date
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(series.lastAirDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Networks */}
              {series.networks && series.networks.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                    Networks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {series.networks.map((network) => (
                      <span
                        key={network}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {network}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">
                      Completion
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {series.watchProgress}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">
                      Seasons Progress
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {watchedCount}/{series.totalSeasons}
                    </span>
                  </div>
                  {series.popularity && series.popularity > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">
                        Popularity
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {Math.round(series.popularity)}
                      </span>
                    </div>
                  )}
                  {series.voteCount && series.voteCount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Votes
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {series.voteCount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsEditing(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
