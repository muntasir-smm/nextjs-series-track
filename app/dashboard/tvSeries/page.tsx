// app/dashboard/tvSeries/page.tsx

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import EditSeriesForm from "../../ui/tvSeries/edit-series-form";
import SeriesList from "../../ui/tvSeries/series-list";
import Pagination from "@/app/ui/pagination";
import SeriesControls from "@/app/ui/tvSeries/series-controls";
import type {
  FilterOption,
  SortOption,
  PageSizeOption,
  ViewMode,
} from "@/app/ui/tvSeries/series-controls";
import AddSeriesModal from "@/app/ui/dashboard/add-series-modal";

import { TvIcon } from "@heroicons/react/24/outline";

import {
  getUserSeries,
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
  type Series,
} from "@/app/lib/series";

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-3xl bg-gray-200 dark:bg-gray-700" />
      <div className="h-14 rounded-2xl bg-gray-200 dark:bg-gray-700" />
      <div className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SeriesContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<PageSizeOption>(10);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Submission
  const [isEditing, setIsEditing] = useState(false);

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Load saved view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("seriesViewPreference");
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("seriesViewPreference", mode);
  }, []);

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

  useEffect(() => {
    const handleSeriesAdded = async () => {
      const updatedSeries = await getUserSeries();
      setSeries(updatedSeries);
      setCurrentPage(1);
    };

    window.addEventListener("series-added", handleSeriesAdded);

    return () => {
      window.removeEventListener("series-added", handleSeriesAdded);
    };
  }, []);

  // Debounced search - update URL
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const url = new URL(window.location.href);

      if (searchInputValue) {
        url.searchParams.set("query", searchInputValue);
      } else {
        url.searchParams.delete("query");
      }

      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInputValue]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, sortBy, filterBy]);

  // Sync search input with URL param
  useEffect(() => {
    setSearchInputValue(searchQuery);
  }, [searchQuery]);

  // Filter + Search + Sort
  const filteredSeries = React.useMemo(() => {
    let filtered = [...series];

    // Search
    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filters
    if (filterBy === "upcoming") {
      filtered = filtered.filter((s) => s.upcomingSeasons.length > 0);
    }

    if (filterBy === "completed") {
      filtered = filtered.filter(
        (s) => s.watchedSeasons.filter(Boolean).length === s.totalSeasons,
      );
    }

    if (filterBy === "watching") {
      filtered = filtered.filter((s) => s.watchedSeasons.some(Boolean));
    }

    // Sorting
    switch (sortBy) {
      case "old":
        filtered = [...filtered].reverse();
        break;

      case "az":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "za":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "largest":
        filtered.sort((a, b) => b.totalSeasons - a.totalSeasons);
        break;

      case "smallest":
        filtered.sort((a, b) => a.totalSeasons - b.totalSeasons);
        break;

      case "recent":
      default:
        // Default order (newest first)
        break;
    }

    return filtered;
  }, [series, searchQuery, sortBy, filterBy]);

  const paginatedSeries = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredSeries.slice(start, end);
  }, [filteredSeries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSeries.length / itemsPerPage);

  const clearAllFilters = () => {
    setFilterBy("all");
    setSortBy("recent");
    setSearchInputValue("");
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

  // Handle series added from modal
  const handleSeriesAdded = useCallback(() => {
    const refreshSeries = async () => {
      const updatedSeries = await getUserSeries();
      setSeries(updatedSeries);
      setCurrentPage(1);
    };
    refreshSeries();
  }, []);

  if (isLoading) return <LoadingSkeleton />;

  const filterLabel: Record<string, string> = {
    all: "All Series",
    watching: "Watching",
    completed: "Completed",
    upcoming: "Upcoming",
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-sm dark:border-gray-700">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            {/* Left */}
            <div className="flex items-start gap-4 text-white">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <TvIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My TV Series Collection
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  Manage and track everything you watch in one place
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6 sm:text-right">
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-100">
                  {filterLabel[filterBy]}
                </p>
                <p className="text-3xl font-bold text-white">
                  {filteredSeries.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Series Controls */}
      <SeriesControls
        searchQuery={searchInputValue}
        onSearchChange={setSearchInputValue}
        searchPlaceholder="Search your series..."
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        sortBy={sortBy}
        onSortChange={setSortBy}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalItems={series.length}
        filteredCount={filteredSeries.length}
        onClearFilters={clearAllFilters}
        hasActiveFilters={
          filterBy !== "all" || sortBy !== "recent" || searchInputValue !== ""
        }
      />

      {/* Series List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="p-5">
          {filteredSeries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-blue-100 p-6 dark:bg-blue-900/20">
                <TvIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
                No Series Found
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {searchInputValue
                  ? `No results found for "${searchInputValue}". Try another search term.`
                  : "You haven't added any TV series yet. Start building your collection."}
              </p>
              {(filterBy !== "all" || searchInputValue) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <SeriesList
                series={paginatedSeries}
                updateSeries={updateSeries}
                deleteSeries={deleteSeries}
                onEditSeries={openEditModal}
                viewMode={viewMode}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Edit Modal */}
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

      {/* Add Series Modal - Removed unused existingSeriesNames prop */}
      <AddSeriesModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSeriesAdded={handleSeriesAdded}
      />
    </div>
  );
}

export default function SeriesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SeriesContent />
    </Suspense>
  );
}
