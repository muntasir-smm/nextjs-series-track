// app/dashboard/(overview)/page.tsx

"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserSeries,
  addSeries as addSeriesAction,
  updateWatchProgress,
  deleteSeries as deleteSeriesAction,
  updateSeries as updateSeriesAction,
} from "@/app/lib/series";
import EditSeriesForm from "@/app/ui/tvSeries/edit-series-form";
import { ViewToggle } from "@/app/ui/tvSeries/series-controls";
import type { ViewMode } from "@/app/ui/tvSeries/series-controls";
import type { Series } from "@/app/lib/series";
import { HeroSection } from "./components/hero-section";
import { StatsSection } from "./components/stats-section";
import { RecentlyAddedSection } from "./components/recently-added-section";
import { TrendingSection } from "./components/trending-section";
import { EmptyState } from "./components/empty-state";
import type { SuggestedSeries } from "@/app/lib/definitions";

// Simple array comparison
const arraysEqual = (a: boolean[], b: boolean[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export default function Page() {
  // State
  const [seriesData, setSeriesData] = useState<Series[]>([]);
  const [suggestedSeries, setSuggestedSeries] = useState<SuggestedSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingSeriesId, setAddingSeriesId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Refs
  const isMounted = useRef(true);
  const seriesMapRef = useRef<Map<string, Series>>(new Map());
  const popularAbortControllerRef = useRef<AbortController | null>(null);
  const loadCounterRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (popularAbortControllerRef.current) {
        popularAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Update map when series data changes
  useEffect(() => {
    seriesMapRef.current = new Map(seriesData.map((s) => [s.id, s]));
  }, [seriesData]);

  // Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Load user profile
  useEffect(() => {
    let isActive = true;

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (isActive && isMounted.current) {
          setUserName(data.name || "User");
          setAvatarUrl(data.avatar_url);
        }
      })
      .catch((err) => console.error("Error loading user:", err));

    return () => {
      isActive = false;
    };
  }, []);

  // Load series
  const loadSeries = useCallback(async () => {
    const currentLoadId = ++loadCounterRef.current;

    setIsLoading(true);

    try {
      const series = await getUserSeries();

      // Only update if this is still the latest request and component is mounted
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
      // Only set loading false if this is the latest request
      if (currentLoadId === loadCounterRef.current && isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load popular series with AbortController
  const loadPopularSeries = useCallback(async () => {
    // Cancel previous request
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

  // Initial load
  useEffect(() => {
    loadSeries();
    loadPopularSeries();
  }, [loadSeries, loadPopularSeries]);

  // Handle series added event - background refresh
  useEffect(() => {
    const handleSeriesAdded = () => {
      loadSeries();
      loadPopularSeries();
    };
    window.addEventListener("series-added", handleSeriesAdded);
    return () => window.removeEventListener("series-added", handleSeriesAdded);
  }, [loadSeries, loadPopularSeries]);

  // Get existing series TMDB IDs for duplicate checking
  const existingSeriesTmdbIds = useMemo(() => {
    return new Set(
      seriesData
        .map((s) => s.tmdbId)
        .filter((id): id is number => id !== undefined),
    );
  }, [seriesData]);

  // Add suggested series with duplicate check by TMDB ID
  const handleAddSuggestedSeries = useCallback(
    async (series: SuggestedSeries) => {
      // Check if series already exists by TMDB ID
      const alreadyExists = series.tmdbId
        ? existingSeriesTmdbIds.has(series.tmdbId)
        : false;

      if (alreadyExists) {
        setDuplicateError(`"${series.name}" is already in your collection!`);
        setTimeout(() => setDuplicateError(null), 3000);
        return;
      }

      setAddingSeriesId(series.id);
      setDuplicateError(null);

      try {
        // Pass tmdbId as first parameter (number)
        const result = await addSeriesAction(
          series.tmdbId, // TMDB ID as number
          series.name,
          series.totalSeasons,
          [],
          series.posterPath,
          series.backdropPath,
          series.overview,
        );

        // Check for duplicate response from server
        if (result.duplicate) {
          setDuplicateError(
            result.error || `"${series.name}" is already in your collection`,
          );
          setAddingSeriesId(null);
          return;
        }

        if (result.success && isMounted.current) {
          await loadSeries();
          await loadPopularSeries();
        }
      } catch (err) {
        console.error("Error adding series:", err);
      } finally {
        if (isMounted.current) setAddingSeriesId(null);
      }
    },
    [loadSeries, loadPopularSeries, existingSeriesTmdbIds],
  );

  // Update series with proper merge
  const updateSeries = useCallback(
    async (updatedSeries: Series[]) => {
      const updatedMap = new Map(updatedSeries.map((s) => [s.id, s]));

      setSeriesData((prev) =>
        prev.map((series) => updatedMap.get(series.id) || series),
      );

      const changedSeries = updatedSeries.filter((series) => {
        const original = seriesMapRef.current.get(series.id);
        return (
          original &&
          !arraysEqual(original.watchedSeasons, series.watchedSeasons)
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

  // Delete series
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

  // Edit modal handlers
  const openEditModal = useCallback((series: Series) => {
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

  // View mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("dashboardViewMode");
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("dashboardViewMode", mode);
  }, []);

  // Calculate stats - single pass O(n)
  const stats = useMemo(() => {
    let totalSeasons = 0;
    let watchedSeasons = 0;
    let completed = 0;

    for (const s of seriesData) {
      totalSeasons += s.totalSeasons;
      const watched = s.watchedSeasons.filter(Boolean).length;
      watchedSeasons += watched;
      if (s.watchProgress === 100) completed++;
    }

    const progress =
      totalSeasons > 0 ? Math.round((watchedSeasons / totalSeasons) * 100) : 0;

    const recentlyAdded = [...seriesData]
      .sort((a, b) => {
        const aNum = parseInt(a.id.split("-").pop() || "0");
        const bNum = parseInt(b.id.split("-").pop() || "0");
        return bNum - aNum;
      })
      .slice(0, 6);

    return {
      totalSeries: seriesData.length,
      totalSeasons,
      watchedSeasons,
      remainingSeasons: totalSeasons - watchedSeasons,
      progress,
      recentlyAdded,
      completed,
    };
  }, [seriesData]);

  // Filter undiscovered series using TMDB ID
  const userSeriesTmdbIds = useMemo(
    () =>
      new Set(
        seriesData
          .map((s) => s.tmdbId)
          .filter((id): id is number => id !== undefined),
      ),
    [seriesData],
  );

  const undiscoveredSeries = suggestedSeries.filter(
    (s) => !userSeriesTmdbIds.has(s.tmdbId),
  );

  // Show loading only when loading and no data
  if (isLoading && seriesData.length === 0 && !error) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  const hasSeries = stats.totalSeries > 0;

  return (
    <main className="space-y-8">
      {/* Duplicate Error Alert */}
      {duplicateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            {duplicateError}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <HeroSection
        userName={userName}
        avatarUrl={avatarUrl}
        greeting={greeting}
        totalSeries={stats.totalSeries}
        overallProgress={stats.progress}
        completedSeries={stats.completed}
        hasSeries={hasSeries}
      />

      {hasSeries && (
        <>
          <StatsSection
            stats={{
              totalSeries: stats.totalSeries,
              completedSeries: stats.completed,
              totalSeasons: stats.totalSeasons,
              totalWatchedSeasons: stats.watchedSeasons,
              remainingSeasons: stats.remainingSeasons,
              overallProgress: stats.progress,
            }}
            onRefresh={() => loadSeries()}
          />

          <RecentlyAddedSection
            series={stats.recentlyAdded}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onUpdateSeries={updateSeries}
            onDeleteSeries={deleteSeries}
            onEditSeries={openEditModal}
          />
        </>
      )}

      {undiscoveredSeries.length > 0 && (
        <TrendingSection
          series={undiscoveredSeries}
          onAdd={handleAddSuggestedSeries}
          addingId={addingSeriesId}
        />
      )}

      {!hasSeries && <EmptyState />}

      <AnimatePresence>
        {isEditModalOpen && editingSeries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <EditSeriesForm
                series={editingSeries}
                onSave={handleEditSeries}
                onCancel={() => setIsEditModalOpen(false)}
                isSubmitting={isEditing}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
