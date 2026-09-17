// app/admin/components/FeaturedSeries.tsx

"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface FeaturedItem {
  id: number;
  series_id: string;
  series_name: string;
  poster_path: string;
  reason: string;
  is_active: boolean;
  media_type?: "tv" | "movie";
}

type SearchHit = {
  id: number;
  name: string;
  posterPath?: string | null;
  mediaType: "tv" | "movie";
  totalSeasons?: number;
  releaseDate?: string | null;
  firstAirDate?: string | null;
};

function MediaBadge({ type }: { type: "tv" | "movie" }) {
  return (
    <span
      className={clsx(
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
        type === "movie"
          ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
          : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
      )}
    >
      {type === "movie" ? "Movie" : "TV"}
    </span>
  );
}

function metaLine(item: {
  mediaType?: "tv" | "movie";
  totalSeasons?: number;
  releaseDate?: string | null;
  firstAirDate?: string | null;
}) {
  const type = item.mediaType || "tv";
  if (type === "movie") {
    const y = (item.releaseDate || "").slice(0, 4);
    return y || "Movie";
  }
  return `${item.totalSeasons || "?"} seasons`;
}

export default function FeaturedSeries() {
  const [featuredSeries, setFeaturedSeries] = useState<FeaturedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<SearchHit | null>(null);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedSeries();
  }, []);

  const loadFeaturedSeries = async () => {
    try {
      const response = await fetch("/api/admin/featured");
      const data = await response.json();
      setFeaturedSeries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading featured:", err);
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
      const res = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(query)}&type=multi`,
      );
      const data = await res.json();
      const raw = data.results || data.series || [];
      setSearchResults(
        raw
          .map((item: any): SearchHit | null => {
            const mt = item.mediaType || item.media_type;
            if (mt !== "movie" && mt !== "tv") return null;
            const id = Number(item.tmdbId ?? item.id);
            if (!Number.isFinite(id)) return null;
            return {
              id,
              name: item.name || item.title || "Untitled",
              posterPath: item.posterPath ?? item.poster_path ?? null,
              mediaType: mt,
              totalSeasons: item.totalSeasons ?? item.number_of_seasons,
              releaseDate: item.releaseDate ?? item.release_date ?? null,
              firstAirDate: item.firstAirDate ?? item.first_air_date ?? null,
            };
          })
          .filter((x: SearchHit | null): x is SearchHit => x != null),
      );
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeries(null);
    setReason("");
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  const addFeaturedSeries = async () => {
    if (!selectedSeries) return;
    setError(null);
    try {
      const response = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_id: String(selectedSeries.id),
          series_name: selectedSeries.name,
          poster_path: selectedSeries.posterPath,
          reason: reason || "Featured pick",
          media_type: selectedSeries.mediaType || "tv",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Failed to add featured item");
        return;
      }
      await loadFeaturedSeries();
      closeModal();
    } catch (err) {
      console.error("Error adding featured:", err);
      setError("Network error. Please try again.");
    }
  };

  const removeFeaturedSeries = async (id: number) => {
    if (!confirm("Remove this title from featured?")) return;
    try {
      const response = await fetch(`/api/admin/featured?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) await loadFeaturedSeries();
    } catch (err) {
      console.error("Error removing featured:", err);
    }
  };

  const getPosterUrl = (posterPath: string | null | undefined) => {
    if (!posterPath) return null;
    return posterPath.startsWith("http")
      ? posterPath
      : `https://image.tmdb.org/t/p/w92${posterPath}`;
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
            Featured
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Movies &amp; series shown on the homepage
          </p>
        </div>
        <button
          type="button"
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
          <p className="mt-3 text-sm text-slate-500">No featured titles yet</p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Add your first featured title
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSeries.map((item) => {
            const type = item.media_type || "tv";
            const poster = getPosterUrl(item.poster_path);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
              >
                {poster && (
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={poster}
                      alt={item.series_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate font-medium text-slate-900 dark:text-white">
                      {item.series_name}
                    </h4>
                    <MediaBadge type={type} />
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    {item.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFeaturedSeries(item.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  aria-label="Remove featured"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
                Add featured title
              </h2>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchTMDB(e.target.value);
                  }}
                  placeholder="Search movies & TV..."
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
                  {searchResults.map((hit) => (
                    <button
                      key={`${hit.mediaType}-${hit.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedSeries(hit);
                        setSearchResults([]);
                        setSearchQuery("");
                      }}
                      className="flex w-full gap-2 rounded-lg p-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {hit.posterPath && (
                        <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${hit.posterPath}`}
                            alt={hit.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {hit.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <MediaBadge type={hit.mediaType} />
                          <span>{metaLine(hit)}</span>
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
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <MediaBadge type={selectedSeries.mediaType} />
                        <span>{metaLine(selectedSeries)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSeries(null)}
                        className="mt-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        Change selection
                      </button>
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

              {error && (
                <p className="mb-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={addFeaturedSeries}
                  disabled={!selectedSeries}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  Add to Featured
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
