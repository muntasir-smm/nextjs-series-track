// app/dashboard/tvSeries/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AddSeriesForm from "../../ui/tvSeries/add-series-form";
import SeriesList from "../../ui/tvSeries/series-list";
import Search from "../../ui/search";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  getUserSeries,
  addSeries as addSeriesAction,
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
  type Series,
} from "@/app/lib/series";

const SeriesPage: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  const [series, setSeries] = useState<Series[]>([]);
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

  // Filter series based on URL search query
  const filteredSeries = series.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addSeries = async (
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
  ) => {
    try {
      const result = await addSeriesAction(name, totalSeasons, upcomingSeasons);
      if (result.success) {
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
    try {
      for (const seriesItem of updatedSeries) {
        await updateSeriesAction(seriesItem);
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
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          TV Series
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage and track your favorite TV series
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
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

        <div className="lg:w-1/3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search Series
            </h2>
            <Search placeholder="Search series..." />
            {searchQuery && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing results for: "
                  <span className="font-medium">{searchQuery}</span>"
                </p>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("query");
                    window.history.pushState({}, "", url.toString());
                    // Force a re-render by dispatching a popstate event
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Series(TV Series page) ({filteredSeries.length})
          </h2>
        </div>
        <div className="p-4">
          {filteredSeries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? `No series found matching "${searchQuery}"`
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
