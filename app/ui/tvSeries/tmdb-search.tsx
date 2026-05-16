// app/ui/tvSeries/tmdb-search.tsx

"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface TMDBShow {
  id: string;
  name: string;
  totalSeasons: number;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string;
  voteAverage: number;
}

interface TMDBSeachProps {
  onSelectSeries: (show: {
    name: string;
    totalSeasons: number;
    upcomingSeasons: string[];
    posterPath: string | null;
    backdropPath: string | null;
    overview: string;
  }) => void;
  onCancel: () => void;
}

export default function TMDBSeach({
  onSelectSeries,
  onCancel,
}: TMDBSeachProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTMDB = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.series || []);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (path: string | null, size: string = "w185") => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const handleSelect = (show: TMDBShow) => {
    onSelectSeries({
      name: show.name,
      totalSeasons: show.totalSeasons,
      upcomingSeasons: [],
      posterPath: show.posterPath,
      backdropPath: show.backdropPath,
      overview: show.overview,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchTMDB(e.target.value);
          }}
          placeholder="Search for a TV series (e.g., Breaking Bad)..."
          className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:text-black focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-96 overflow-y-auto space-y-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
          {results.map((show) => (
            <button
              key={show.id}
              onClick={() => handleSelect(show)}
              className="flex w-full gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {/* Poster */}
              {getImageUrl(show.posterPath) ? (
                <Image
                  src={getImageUrl(show.posterPath)!}
                  alt={show.name}
                  width={48}
                  height={64}
                  className="h-16 w-12 rounded object-cover"
                />
              ) : (
                <div className="flex h-16 w-12 items-center justify-center rounded bg-gray-200 text-xs text-gray-500 dark:bg-gray-700">
                  No image
                </div>
              )}

              {/* Details */}
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {show.name}
                </div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {show.firstAirDate?.split("-")[0] || "Unknown"} •{" "}
                  {show.totalSeasons} season{show.totalSeasons !== 1 ? "s" : ""}
                  {show.voteAverage > 0 &&
                    ` • ⭐ ${show.voteAverage.toFixed(1)}`}
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                  {show.overview || "No description available."}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {query && results.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No series found. Try a different search term.
        </div>
      )}

      <button
        onClick={onCancel}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        Cancel
      </button>
    </div>
  );
}
