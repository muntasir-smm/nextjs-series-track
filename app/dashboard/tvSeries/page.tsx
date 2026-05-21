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

import {
  MagnifyingGlassIcon,
  XMarkIcon,
  TvIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

import {
  getUserSeries,
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
  type Series,
} from "@/app/lib/series";

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {" "}
      <div className="h-32 rounded-3xl bg-gray-200 dark:bg-gray-700" />{" "}
      <div className="h-14 rounded-2xl bg-gray-200 dark:bg-gray-700" />{" "}
      <div className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {" "}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-700"
            />
          ))}{" "}
        </div>{" "}
      </div>{" "}
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");

  // Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);

  // Submission
  const [isEditing, setIsEditing] = useState(false);

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout>();

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

  // Debounced search
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

  // Filter + Search + Sort
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
      case "az":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "seasons":
        filtered.sort((a, b) => b.totalSeasons - a.totalSeasons);
        break;
      default:
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

  const clearSearch = () => setSearchInputValue("");

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

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}{" "}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        {" "}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          My Series Collection{" "}
        </h2>{" "}
        <p className="mt-1 text-sm text-gray-500">
          Showing {paginatedSeries.length} of {filteredSeries.length} series{" "}
        </p>{" "}
      </div>
      {/* Search + Filters */}
      <div className="sticky top-0 z-20 rounded-2xl bg-gray-50/80 backdrop-blur dark:bg-gray-900/80">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/80 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="Search your series..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {searchInputValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">All</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Recently Added</option>
              <option value="az">A-Z</option>
              <option value="seasons">Most Seasons</option>
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10/page</option>
              <option value={20}>20/page</option>
              <option value={50}>50/page</option>
            </select>

            <button onClick={clearAllFilters} className="text-xs">
              Clear
            </button>
          </div>
        </div>
      </div>
      {/* List */}
      <div className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {filteredSeries.length === 0 ? (
          <div className="py-20 text-center">
            <TvIcon className="mx-auto h-12 w-12 text-blue-500" />
            <h3 className="mt-4 text-lg font-semibold">No Series Found</h3>
            <p className="text-sm text-gray-500">
              Start adding your favorite TV series
            </p>
          </div>
        ) : (
          <SeriesList
            series={paginatedSeries}
            updateSeries={updateSeries}
            deleteSeries={deleteSeries}
            onEditSeries={openEditModal}
          />
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      {/* Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingSeries && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md">
              <EditSeriesForm
                series={editingSeries}
                onSave={handleEditSeries}
                onCancel={() => setIsEditModalOpen(false)}
                isSubmitting={isEditing}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SeriesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {" "}
      <SeriesContent />{" "}
    </Suspense>
  );
}
