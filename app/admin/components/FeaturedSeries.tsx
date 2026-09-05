// app/admin/components/FeaturedSeries.tsx

"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface FeaturedSeriesItem {
  id: number;
  series_id: string;
  series_name: string;
  poster_path: string;
  reason: string;
  is_active: boolean;
}

export default function FeaturedSeries() {
  const [featuredSeries, setFeaturedSeries] = useState<FeaturedSeriesItem[]>(
    [],
  );
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
      if (response.ok) await loadFeaturedSeries();
    } catch (error) {
      console.error("Error removing featured series:", error);
    }
  };

  const getPosterUrl = (posterPath: string) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w92${posterPath}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Featured Series
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Series shown on homepage
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add Featured
        </button>
      </div>

      {featuredSeries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-600">
          <StarIcon className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500">No featured series yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Add your first featured series
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSeries.map((series) => (
            <div
              key={series.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              {getPosterUrl(series.poster_path) && (
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={getPosterUrl(series.poster_path)!}
                    alt={series.series_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium text-slate-900 dark:text-white">
                  {series.series_name}
                </h4>
                <p className="truncate text-xs text-slate-500">
                  {series.reason}
                </p>
              </div>
              <button
                onClick={() => removeFeaturedSeries(series.id)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
                Add Featured Series
              </h2>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchTMDB(e.target.value);
                  }}
                  placeholder="Search for a series..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  </div>
                )}
              </div>

              {searchResults.length > 0 && !selectedSeries && (
                <div className="mb-4 max-h-60 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                  {searchResults.map((series: any) => (
                    <button
                      key={series.id}
                      onClick={() => {
                        setSelectedSeries(series);
                        setSearchResults([]);
                        setSearchQuery("");
                      }}
                      className="flex w-full gap-2 rounded-lg p-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {series.posterPath && (
                        <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded">
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${series.posterPath}`}
                            alt={series.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {series.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {series.totalSeasons || "?"} seasons
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedSeries && (
                <div className="mb-4 rounded-xl bg-brand-50 p-3 dark:bg-brand-950/30">
                  <div className="flex gap-3">
                    {selectedSeries.posterPath && (
                      <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded">
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${selectedSeries.posterPath}`}
                          alt={selectedSeries.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedSeries.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedSeries.totalSeasons || "?"} seasons
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for featuring (optional)"
                className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />

              <div className="flex gap-3">
                <button
                  onClick={addFeaturedSeries}
                  disabled={!selectedSeries}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  Add to Featured
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
