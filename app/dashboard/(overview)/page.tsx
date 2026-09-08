// app/dashboard/(overview)/page.tsx

"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  getUserSeries,
  addSeries as addSeriesAction,
  updateWatchProgress,
  deleteSeries as deleteSeriesAction,
  updateSeries as updateSeriesAction,
} from "@/app/lib/series";
import EditSeriesForm from "@/app/ui/tvSeries/edit-series-form";
import type { ViewMode } from "@/app/ui/tvSeries/series-controls";
import type { Series } from "@/app/lib/series";
import type { SuggestedSeries } from "@/app/lib/definitions";

import { StatsSection } from "./components/stats-section";
import { RecentlyAddedSection } from "./components/recently-added-section";
import { TrendingSection } from "./components/trending-section";
import { EmptyState } from "./components/empty-state";
import { FeaturedSection } from "./components/featured-section";

const arraysEqual = (a: boolean[], b: boolean[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export default function Page() {
  const [seriesData, setSeriesData] = useState<Series[]>([]);
  const [suggestedSeries, setSuggestedSeries] = useState<SuggestedSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingSeriesId, setAddingSeriesId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [userName, setUserName] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const isMounted = useRef(true);
  const seriesMapRef = useRef<Map<string, Series>>(new Map());
  const popularAbortControllerRef = useRef<AbortController | null>(null);
  const loadCounterRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      popularAbortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    seriesMapRef.current = new Map(seriesData.map((s) => [s.id, s]));
  }, [seriesData]);

  useEffect(() => {
    let isActive = true;
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (isActive && isMounted.current) {
          setUserName(data.name || "User");
        }
      })
      .catch((err) => console.error("Error loading user:", err));
    return () => {
      isActive = false;
    };
  }, []);

  const loadSeries = useCallback(async () => {
    const currentLoadId = ++loadCounterRef.current;
    setIsLoading(true);

    try {
      const series = await getUserSeries();
      if (currentLoadId === loadCounterRef.current && isMounted.current) {
        setSeriesData(series);
        setError(null);
      }
    } catch (err) {
      console.error("Error loading series:", err);
      if (isMounted.current) {
        setError("Failed to load your series. Please refresh the page.");
      }
    } finally {
      if (currentLoadId === loadCounterRef.current && isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const loadPopularSeries = useCallback(async () => {
    if (popularAbortControllerRef.current) {
      popularAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    popularAbortControllerRef.current = controller;

    try {
      const res = await fetch("/api/tmdb/popular?page=1&limit=9", {
        signal: controller.signal,
      });
      const data = await res.json();
      if (isMounted.current && !controller.signal.aborted) {
        setSuggestedSeries(data.series || []);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error loading popular series:", err);
      }
    } finally {
      if (popularAbortControllerRef.current === controller) {
        popularAbortControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    loadSeries();
    loadPopularSeries();
  }, [loadSeries, loadPopularSeries]);

  useEffect(() => {
    const handleSeriesAdded = () => {
      loadSeries();
      loadPopularSeries();
    };
    window.addEventListener("series-added", handleSeriesAdded);
    return () => window.removeEventListener("series-added", handleSeriesAdded);
  }, [loadSeries, loadPopularSeries]);

  // ::::::::::::::::::::::::::
  const existingLibraryKeys = useMemo(() => {
    return new Set(
      seriesData
        .filter((s) => s.tmdbId != null)
        .map((s) => `${s.mediaType || "tv"}:${s.tmdbId}`),
    );
  }, [seriesData]);

  const handleAddSuggestedSeries = useCallback(
    async (series: SuggestedSeries) => {
      const key = `tv:${series.tmdbId}`;
      if (existingLibraryKeys.has(key)) {
        setDuplicateError(`"${series.name}" is already in your collection!`);
        setTimeout(() => setDuplicateError(null), 3000);
        return;
      }

      setAddingSeriesId(series.id);
      setDuplicateError(null);

      try {
        // Always load full TV details before insert
        const res = await fetch(`/api/tmdb/tv/${series.tmdbId}`);
        if (!res.ok) throw new Error("Failed to load details");
        const d = await res.json();

        const result = await addSeriesAction(
          d.id,
          d.name,
          d.totalSeasons || 0,
          [],
          d.posterPath,
          d.backdropPath,
          d.overview,
          d.voteAverage,
          d.voteCount,
          d.firstAirDate,
          d.lastAirDate,
          d.genres,
          d.status,
          d.tagline,
          d.originalName,
          d.originalLanguage,
          d.popularity,
          d.inProduction,
          d.networks,
          d.totalEpisodes,
          d.seasons,
        );

        if (result.duplicate) {
          setDuplicateError(
            result.error || `"${series.name}" is already in your collection`,
          );
          return;
        }

        if (result.success && isMounted.current) {
          window.dispatchEvent(new CustomEvent("series-added"));
          await loadSeries();
          await loadPopularSeries();
        }
      } catch (err) {
        console.error("Error adding series:", err);
        setDuplicateError("Failed to add. Please try again.");
        setTimeout(() => setDuplicateError(null), 3000);
      } finally {
        if (isMounted.current) setAddingSeriesId(null);
      }
    },
    [loadSeries, loadPopularSeries, existingLibraryKeys],
  );

  const stats = useMemo(() => {
    let totalSeasons = 0;
    let watchedSeasons = 0;
    let completed = 0;
    let movieCount = 0;
    let tvCount = 0;
    let moviesWatched = 0;

    for (const s of seriesData) {
      const isMovie = (s.mediaType || "tv") === "movie";
      if (isMovie) {
        movieCount++;
        if (s.watched || Number(s.watchProgress) >= 100) {
          moviesWatched++;
          completed++;
        }
      } else {
        tvCount++;
        const seasons = Number(s.totalSeasons) || 0;
        totalSeasons += seasons;
        const watched = (s.watchedSeasons || []).filter(Boolean).length;
        watchedSeasons += watched;
        if (Number(s.watchProgress) >= 100) completed++;
      }
    }

    const progress =
      totalSeasons > 0
        ? Math.round((watchedSeasons / totalSeasons) * 100)
        : movieCount > 0
          ? Math.round((moviesWatched / movieCount) * 100)
          : 0;

    // getUserSeries is ORDER BY created_at DESC — first items are newest
    const recentlyAdded = seriesData.slice(0, 6);

    return {
      totalSeries: seriesData.length,
      totalMovies: movieCount,
      totalTv: tvCount,
      totalSeasons,
      totalWatchedSeasons: watchedSeasons,
      remainingSeasons: Math.max(0, totalSeasons - watchedSeasons),
      overallProgress: progress,
      recentlyAdded,
      completedSeries: completed,
    };
  }, [seriesData]);

  const undiscoveredSeries = suggestedSeries.filter(
    (s) => !existingLibraryKeys.has(`tv:${s.tmdbId}`),
  );
  // ::::::::::::::::::::::::::

  const updateSeries = useCallback(
    async (updatedSeries: Series[]) => {
      const updatedMap = new Map(updatedSeries.map((s) => [s.id, s]));

      setSeriesData((prev) =>
        prev.map((series) => updatedMap.get(series.id) || series),
      );

      const changedSeries = updatedSeries.filter((series) => {
        if ((series.mediaType || "tv") === "movie") return false;
        const original = seriesMapRef.current.get(series.id);
        if (!original) return false;
        return !arraysEqual(
          original.watchedSeasons || [],
          series.watchedSeasons || [],
        );
      });

      if (changedSeries.length === 0) return;

      try {
        await Promise.all(
          changedSeries.map((series) =>
            updateWatchProgress(series.id, series.watchedSeasons),
          ),
        );
      } catch (err) {
        console.error("Failed to update progress:", err);
        await loadSeries();
        if (isMounted.current)
          setError("Failed to update. Reloaded latest data.");
        setTimeout(() => {
          if (isMounted.current) setError(null);
        }, 3000);
      }
    },
    [loadSeries],
  );

  const deleteSeries = useCallback(
    async (id: string) => {
      if (!confirm("Delete this series?")) return;

      const previous = seriesData;
      setSeriesData((prev) => prev.filter((s) => s.id !== id));

      try {
        const result = await deleteSeriesAction(id);
        if (!result.success && isMounted.current) {
          setSeriesData(previous);
          setError(result.error || "Failed to delete");
          setTimeout(() => setError(null), 3000);
        }
      } catch (err) {
        console.error("Error deleting series:", err);
        if (isMounted.current) {
          setSeriesData(previous);
          setError("Failed to delete. Please try again.");
          setTimeout(() => setError(null), 3000);
        }
      }
    },
    [seriesData],
  );

  const openEditModal = useCallback((series: Series) => {
    if ((series.mediaType || "tv") === "movie") return;
    setEditingSeries(series);
    setIsEditModalOpen(true);
  }, []);

  const handleEditSeries = useCallback(
    async (
      id: string,
      name: string,
      totalSeasons: number,
      upcomingSeasons: string[],
    ) => {
      setIsEditing(true);

      const seriesToUpdate = seriesMapRef.current.get(id);
      if (!seriesToUpdate) {
        setIsEditing(false);
        return;
      }

      const updatedSeries = {
        ...seriesToUpdate,
        name,
        totalSeasons,
        upcomingSeasons,
      };

      setSeriesData((prev) =>
        prev.map((s) => (s.id === id ? updatedSeries : s)),
      );

      try {
        const result = await updateSeriesAction(updatedSeries);
        if (result.success && isMounted.current) {
          await loadSeries();
          setIsEditModalOpen(false);
          setEditingSeries(null);
        } else {
          await loadSeries();
          setError(result.error || "Failed to edit");
          setTimeout(() => setError(null), 3000);
        }
      } catch (err) {
        console.error("Error editing series:", err);
        await loadSeries();
        setError("Failed to edit. Please try again.");
        setTimeout(() => setError(null), 3000);
      } finally {
        if (isMounted.current) setIsEditing(false);
      }
    },
    [loadSeries],
  );

  useEffect(() => {
    const saved = localStorage.getItem("dashboardViewMode");
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("dashboardViewMode", mode);
  }, []);

  if (isLoading && seriesData.length === 0 && !error) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error / Duplicate toast */}
      {(error || duplicateError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error || duplicateError}
        </div>
      )}

      {/* Stats */}
      <StatsSection stats={stats} userName={userName || "Your"} />

      {/* Featured */}
      <FeaturedSection />

      {/* Empty or Recently Added */}
      {seriesData.length === 0 ? (
        <EmptyState />
      ) : (
        <RecentlyAddedSection
          series={stats.recentlyAdded}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onUpdateSeries={updateSeries}
          onDeleteSeries={deleteSeries}
          onEditSeries={openEditModal}
        />
      )}

      {/* Trending */}
      <TrendingSection
        series={undiscoveredSeries}
        onAdd={handleAddSuggestedSeries}
        addingId={addingSeriesId}
      />

      {/* Edit Modal */}
      {isEditModalOpen && editingSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Series
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update series details
              </p>
            </div>
            <EditSeriesForm
              series={editingSeries}
              onSave={handleEditSeries}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingSeries(null);
              }}
              isSubmitting={isEditing}
            />
          </div>
        </div>
      )}
    </div>
  );
}
