// app/admin/components/FeaturedSeries.tsx

"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import SeriesCard from "@/app/ui/series-card";
import Image from "next/image";

interface FeaturedSeries {
  id: number;
  series_id: string;
  series_name: string;
  poster_path: string;
  reason: string;
  is_active: boolean;
}

export default function FeaturedSeries() {
  const [featuredSeries, setFeaturedSeries] = useState<FeaturedSeries[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedSeries();
  }, []);

  const loadFeaturedSeries = async () => {
    try {
      const response = await fetch("/api/admin/featured");
      const data = await response.json();
      setFeaturedSeries(data);
    } catch (error) {
      console.error("Error loading featured series:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchTMDB = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setSearchResults(data.series || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addFeaturedSeries = async () => {
    if (!selectedSeries) return;

    try {
      const response = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_id: selectedSeries.id,
          series_name: selectedSeries.name,
          poster_path: selectedSeries.posterPath,
          reason: reason || "Featured pick",
        }),
      });

      if (response.ok) {
        await loadFeaturedSeries();
        setIsModalOpen(false);
        setSelectedSeries(null);
        setReason("");
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Error adding featured series:", error);
    }
  };

  const removeFeaturedSeries = async (id: number) => {
    if (!confirm("Remove this series from featured?")) return;

    try {
      const response = await fetch(`/api/admin/featured?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadFeaturedSeries();
      }
    } catch (error) {
      console.error("Error removing featured series:", error);
    }
  };

  const getPosterUrl = (posterPath: string) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w92${posterPath}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading featured series...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Featured Series
          </h3>
          <p className="text-sm text-gray-500">Series shown on homepage</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
        >
          <PlusIcon className="h-4 w-4" />
          Add Featured
        </button>
      </div>

      {/* Featured Series Grid */}
      {featuredSeries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
          <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No featured series yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Add your first featured series
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSeries.map((series) => (
            <div
              key={series.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              {getPosterUrl(series.poster_path) && (
                <div className="relative h-12 w-8 flex-shrink-0">
                  <Image
                    src={getPosterUrl(series.poster_path)!}
                    alt={series.series_name}
                    fill
                    className="rounded object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {series.series_name}
                </h4>
                <p className="text-xs text-gray-500">{series.reason}</p>
              </div>
              <button
                onClick={() => removeFeaturedSeries(series.id)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Featured Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Add Featured Series
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchTMDB(e.target.value);
                  }}
                  placeholder="Search for a series..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && !selectedSeries && (
                <div className="mb-4 max-h-60 overflow-y-auto space-y-2 rounded-md border border-gray-200 p-2">
                  {searchResults.map((series: any) => (
                    <button
                      key={series.id}
                      onClick={() => {
                        setSelectedSeries(series);
                        setSearchResults([]);
                        setSearchQuery("");
                      }}
                      className="flex w-full gap-2 rounded-md p-2 text-left hover:bg-gray-50"
                    >
                      {series.posterPath && (
                        <div className="relative h-12 w-8 flex-shrink-0">
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${series.posterPath}`}
                            alt={series.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{series.name}</div>
                        <div className="text-xs text-gray-500">
                          {series.totalSeasons || "?"} seasons
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Series Preview */}
              {selectedSeries && (
                <div className="mb-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                  <div className="flex gap-3">
                    {selectedSeries.posterPath && (
                      <div className="relative h-12 w-8 flex-shrink-0">
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${selectedSeries.posterPath}`}
                          alt={selectedSeries.name}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedSeries.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedSeries.totalSeasons || "?"} seasons
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason */}
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for featuring (optional)"
                className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={addFeaturedSeries}
                  disabled={!selectedSeries}
                  className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Add to Featured
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
