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

import EditSeriesForm from "@/app/ui/tvSeries/edit-series-form";
import SeriesList from "@/app/ui/tvSeries/series-list";
import Pagination from "@/app/ui/pagination";
import SeriesControls from "@/app/ui/tvSeries/series-controls";
import type {
  FilterOption,
  SortOption,
  PageSizeOption,
  ViewMode,
} from "@/app/ui/tvSeries/series-controls";

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
      <div className="h-10 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<PageSizeOption>(10);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const savedView = localStorage.getItem("seriesViewPreference");
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }
  }, []);

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
    return () => window.removeEventListener("series-added", handleSeriesAdded);
  }, []);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, sortBy, filterBy]);

  useEffect(() => {
    setSearchInputValue(searchQuery);
  }, [searchQuery]);

  const filteredSeries = React.useMemo(() => {
    let filtered = [...series];

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

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
      default:
        break;
    }

    return filtered;
  }, [series, searchQuery, sortBy, filterBy]);

  const paginatedSeries = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSeries.slice(start, start + itemsPerPage);
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
    if (!confirm("Are you sure you want to delete this series?")) return;

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
  }, []);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          My TV Series
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {series.length} series in your collection
        </p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <SeriesControls
        searchQuery={searchInputValue}
        onSearchChange={setSearchInputValue}
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
        onClearFilters={clearAllFilters}
        hasActiveFilters={
          filterBy !== "all" || sortBy !== "recent" || searchInputValue !== ""
        }
      />

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="p-5">
          {filteredSeries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/40">
                <TvIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                No Series Found
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {searchInputValue
                  ? `No results for "${searchInputValue}". Try another search.`
                  : "You haven't added any TV series yet."}
              </p>
              {(filterBy !== "all" || searchInputValue) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <SeriesList
              series={paginatedSeries}
              updateSeries={updateSeries}
              deleteSeries={deleteSeries}
              onEditSeries={openEditModal}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-soft-lg dark:border-slate-700 dark:bg-slate-900"
            >
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SeriesContent />
    </Suspense>
  );
}
