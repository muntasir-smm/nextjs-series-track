// app/dashboard/(overview)/page.tsx

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

export default function Page() {
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

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("dashboardViewMode", mode);
  }, []);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("dashboardViewMode") as ViewMode;
    if (savedViewMode === "grid" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }
  }, []);

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
      setError(null);
    } catch (error) {
      console.error("Error loading series:", error);
      setError("Failed to load your series. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPopularSeries = useCallback(async () => {
    try {
      const response = await fetch("/api/tmdb/popular?page=1&limit=9");
      const data = await response.json();
      setSuggestedSeries(data.series || []);
    } catch (error) {
      console.error("Error loading popular series:", error);
    }
  }, []);

  useEffect(() => {
    loadSeries();
    loadPopularSeries();
  }, [loadSeries, loadPopularSeries]);

  useEffect(() => {
    const handleSeriesAdded = async () => {
      await loadSeries();
      await loadPopularSeries();
    };
    window.addEventListener("series-added", handleSeriesAdded);
    return () => window.removeEventListener("series-added", handleSeriesAdded);
  }, [loadSeries, loadPopularSeries]);

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
          await loadPopularSeries();
        }
      } catch (error) {
        console.error("Error adding series:", error);
      } finally {
        setAddingSeriesId(null);
      }
    },
    [loadSeries, loadPopularSeries],
  );

  const updateSeries = useCallback(
    async (updatedSeries: Series[]) => {
      const previousSeries = seriesData;
      setSeriesData(updatedSeries);

      try {
        const changedSeries = updatedSeries.filter((series) => {
          const original = previousSeries.find((s) => s.id === series.id);
          return (
            original &&
            JSON.stringify(original.watchedSeasons) !==
              JSON.stringify(series.watchedSeasons)
          );
        });

        await Promise.all(
          changedSeries.map((series) =>
            updateWatchProgress(series.id, series.watchedSeasons),
          ),
        );
      } catch (error) {
        console.error("Failed to update progress:", error);
        setSeriesData(previousSeries);
        setError("Failed to update watch progress. Please try again.");
      }
    },
    [seriesData],
  );

  const deleteSeries = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this series?")) return;

      const previousSeries = seriesData;
      setSeriesData((prev) => prev.filter((s) => s.id !== id));

      try {
        const result = await deleteSeriesAction(id);
        if (!result.success) {
          setError(result.error || "Failed to delete series");
          setSeriesData(previousSeries);
        }
      } catch (error) {
        console.error("Error deleting series:", error);
        setError("Failed to delete series. Please try again.");
        setSeriesData(previousSeries);
      }
    },
    [seriesData],
  );

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

      const seriesToUpdate = seriesData.find((s) => s.id === id);
      if (!seriesToUpdate) {
        setIsEditing(false);
        return;
      }

      const updatedSeriesObj = {
        ...seriesToUpdate,
        name,
        totalSeasons,
        upcomingSeasons,
      };

      try {
        const result = await updateSeriesAction(updatedSeriesObj);
        if (result.success) {
          await loadSeries();
          setIsEditModalOpen(false);
          setEditingSeries(null);
          setError(null);
        } else {
          setError(result.error || "Failed to edit series");
        }
      } catch (err) {
        console.error("Error editing series:", err);
        setError("Failed to edit series. Please try again.");
      } finally {
        setIsEditing(false);
      }
    },
    [seriesData, loadSeries],
  );

  const userSeriesIds = useMemo(
    () => new Set(seriesData.map((s) => s.id)),
    [seriesData],
  );

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
      .slice(0, 6);
    const completedSeries = seriesData.filter(
      (s) => s.watchProgress === 100,
    ).length;

    return {
      totalSeries,
      totalSeasons,
      totalWatchedSeasons,
      remainingSeasons: totalSeasons - totalWatchedSeasons,
      overallProgress,
      recentlyAdded,
      completedSeries,
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

  const hasSeries = stats.totalSeries > 0;

  return (
    <main className="space-y-8">
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
        overallProgress={stats.overallProgress}
        completedSeries={stats.completedSeries}
        hasSeries={hasSeries}
      />

      {hasSeries && (
        <>
          <StatsSection
            stats={{
              totalSeries: stats.totalSeries,
              completedSeries: stats.completedSeries,
              totalSeasons: stats.totalSeasons,
              totalWatchedSeasons: stats.totalWatchedSeasons,
              remainingSeasons: stats.remainingSeasons,
              overallProgress: stats.overallProgress,
            }}
            onRefresh={loadSeries}
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
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-800"
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
