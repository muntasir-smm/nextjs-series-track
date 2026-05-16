// app/dashboard/tvSeries/page.tsx

"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EditSeriesForm from "../../ui/tvSeries/edit-series-form";
import SeriesList from "../../ui/tvSeries/series-list";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  getUserSeries,
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
  type Series,
} from "@/app/lib/series";

// Create a separate component that uses useSearchParams
function SeriesContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);

  // Submission states
  const [isEditing, setIsEditing] = useState(false);

  // Load series from database
  useEffect(() => {
    const loadSeries = async () => {
      try {
        setIsLoading(true);
        const userSeries = await getUserSeries();
        setSeries(userSeries);
        setError(null);
      } catch (err) {
        console.error("Error loading series:", err);
        setError("Failed to load your series. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSeries();
  }, []);

  // Listen for series added event from floating button
  useEffect(() => {
    const handleSeriesAdded = async () => {
      const updatedSeries = await getUserSeries();
      setSeries(updatedSeries);
    };

    window.addEventListener("series-added", handleSeriesAdded);
    return () => window.removeEventListener("series-added", handleSeriesAdded);
  }, []);

  // Update search input when URL query changes
  useEffect(() => {
    setSearchInputValue(searchQuery);
  }, [searchQuery]);

  // Filter series based on URL search query
  const filteredSeries = React.useMemo(() => {
    if (!searchQuery) return series;
    return series.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [series, searchQuery]);

  const handleSearch = (term: string) => {
    const url = new URL(window.location.href);
    if (term) {
      url.searchParams.set("query", term);
    } else {
      url.searchParams.delete("query");
    }
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const clearSearch = () => {
    setSearchInputValue("");
    handleSearch("");
  };

  const updateSeries = useCallback(async (updatedSeries: Series[]) => {
    setSeries(updatedSeries);
    try {
      for (const seriesItem of updatedSeries) {
        await updateSeriesAction(seriesItem);
      }
    } catch (err) {
      console.error("Error updating series:", err);
      setError("Failed to update series");
    }
  }, []);

  const handleEditSeries = useCallback(
    async (
      id: string,
      name: string,
      totalSeasons: number,
      upcomingSeasons: string[],
    ) => {
      setIsEditing(true);
      const seriesToUpdate = series.find((s) => s.id === id);
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
          const updatedSeries = await getUserSeries();
          setSeries(updatedSeries);
          setIsEditModalOpen(false);
          setEditingSeries(null);
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
    [series],
  );

  const openEditModal = (seriesItem: Series) => {
    setEditingSeries(seriesItem);
    setIsEditModalOpen(true);
  };

  const deleteSeries = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this series?")) {
      setSeries((prev) => prev.filter((s) => s.id !== id));
      try {
        const result = await deleteSeriesAction(id);
        if (!result.success) {
          setError(result.error || "Failed to delete series");
          const userSeries = await getUserSeries();
          setSeries(userSeries);
        }
      } catch (err) {
        console.error("Error deleting series:", err);
        setError("Failed to delete series. Please try again.");
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading your series...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Series Modal */}
      {isEditModalOpen && editingSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingSeries(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              disabled={isEditing}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Edit Series
              </h2>
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
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          TV Series
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage and track your favorite TV series
        </p>
      </div>

      {/* Search Bar Only - Add button removed (now using floating FAB) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => {
              setSearchInputValue(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search series..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:text-black focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Series List */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Series ({filteredSeries.length})
          </h2>
        </div>
        <div className="p-4">
          {filteredSeries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? `No series found matching "${searchQuery}"`
                  : "No series added yet. Click the + button to get started!"}
              </p>
            </div>
          ) : (
            <SeriesList
              series={filteredSeries}
              updateSeries={updateSeries}
              deleteSeries={deleteSeries}
              onEditSeries={openEditModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SeriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SeriesContent />
    </Suspense>
  );
}
