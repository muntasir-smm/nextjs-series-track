// app/dashboard/tvSeries/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import AddSeriesForm from "../../ui/tvSeries/add-series-form";
import SeriesList from "../../ui/tvSeries/series-list";
import SearchBox from "../../ui/tvSeries/search-box";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  getUserSeries,
  addSeries as addSeriesAction,
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
  type Series,
} from "@/app/lib/series";

const SeriesPage: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const addSeries = async (
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
  ) => {
    try {
      const result = await addSeriesAction(name, totalSeasons, upcomingSeasons);
      if (result.success) {
        // Reload series from database
        const updatedSeries = await getUserSeries();
        setSeries(updatedSeries);
      } else {
        setError(result.error || "Failed to add series");
      }
    } catch (err) {
      console.error("Error adding series:", err);
      setError("Failed to add series. Please try again.");
    }
  };

  const updateSeries = async (updatedSeries: Series[]) => {
    // This updates multiple series - you might want to batch this
    // For now, we'll update each series individually
    try {
      for (const series of updatedSeries) {
        await updateSeriesAction(series);
      }
      setSeries(updatedSeries);
    } catch (err) {
      console.error("Error updating series:", err);
      setError("Failed to update series");
    }
  };

  const deleteSeries = async (id: string) => {
    try {
      const result = await deleteSeriesAction(id);
      if (result.success) {
        setSeries(series.filter((s) => s.id !== id));
      } else {
        setError(result.error || "Failed to delete series");
      }
    } catch (err) {
      console.error("Error deleting series:", err);
      setError("Failed to delete series. Please try again.");
    }
  };

  const filteredSeries = series.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          TV Series
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage and track your favorite TV series
        </p>
      </div>

      {/* Add Series and Search Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Add Series Form */}
        <div className="lg:w-2/3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <PlusIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Series
              </h2>
            </div>
            <AddSeriesForm addSeries={addSeries} />
          </div>
        </div>

        {/* Search Box */}
        <div className="lg:w-1/3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Series
              </h2>
            </div>
            <SearchBox searchTerm={searchTerm} onSearch={setSearchTerm} />
          </div>
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
                {searchTerm
                  ? `No series found matching "${searchTerm}"`
                  : "No series added yet. Add your first series above!"}
              </p>
            </div>
          ) : (
            <SeriesList
              series={filteredSeries}
              updateSeries={updateSeries}
              deleteSeries={deleteSeries}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesPage;
