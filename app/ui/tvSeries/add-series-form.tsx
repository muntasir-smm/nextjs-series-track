// app/ui/tvSeries/add-series-form.tsx

"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface TMDBResult {
  id: string;
  name: string;
  totalSeasons: number;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string;
  voteAverage: number;
}

interface AddSeriesFormProps {
  addSeries: (
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
    posterPath?: string | null,
    backdropPath?: string | null,
    overview?: string | null,
  ) => void;
  isSubmitting?: boolean;
}

const AddSeriesForm: React.FC<AddSeriesFormProps> = ({
  addSeries,
  isSubmitting = false,
}) => {
  const [name, setName] = useState("");
  const [totalSeasons, setTotalSeasons] = useState<number | null>(null);
  const [hasUpcoming, setHasUpcoming] = useState<boolean | null>(null);

  // TMDB Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFromTMDB, setSelectedFromTMDB] = useState<TMDBResult | null>(
    null,
  );

  const [errors, setErrors] = useState<{
    name?: string;
    totalSeasons?: string;
    hasUpcoming?: string;
  }>({});

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchTMDB();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const searchTMDB = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();
      setSearchResults(data.series || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchSeriesDetails = async (showId: string) => {
    try {
      const response = await fetch(`/api/tmdb/tv/${showId}`);
      const details = await response.json();
      return details;
    } catch (err) {
      console.error("Failed to fetch details:", err);
      return null;
    }
  };

  const selectFromTMDB = async (show: TMDBResult) => {
    // Fetch full details to get accurate season count
    const details = await fetchSeriesDetails(show.id);

    setName(show.name);
    setTotalSeasons(details?.totalSeasons || show.totalSeasons || 0);
    setSelectedFromTMDB({
      ...show,
      totalSeasons: details?.totalSeasons || show.totalSeasons || 0,
      overview: details?.overview || show.overview,
    });
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const getPosterUrl = (posterPath: string | null, size: string = "w92") => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      totalSeasons?: string;
      hasUpcoming?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Series name is required";
    }

    if (totalSeasons === null || totalSeasons < 1) {
      newErrors.totalSeasons =
        "Total seasons is required and must be at least 1";
    }

    if (hasUpcoming === null) {
      newErrors.hasUpcoming = "Please select Yes or No for upcoming season";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let upcomingSeasons: string[] = [];

    if (hasUpcoming === true) {
      const nextSeasonNumber = (totalSeasons as number) + 1;
      upcomingSeasons = [`Season ${nextSeasonNumber}`];
    }

    addSeries(
      name,
      totalSeasons as number,
      upcomingSeasons,
      selectedFromTMDB?.posterPath,
      selectedFromTMDB?.backdropPath,
      selectedFromTMDB?.overview,
    );

    // Reset form
    setName("");
    setTotalSeasons(null);
    setHasUpcoming(null);
    setSelectedFromTMDB(null);
    setSearchQuery("");
    setErrors({});
  };

  const handleTotalSeasonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setTotalSeasons(null);
    } else {
      const numValue = parseInt(value);
      setTotalSeasons(isNaN(numValue) ? null : numValue);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TMDB Search Section */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search from TMDB
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a TV series (e.g., Breaking Bad)..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-8 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowResults(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {searchResults.map((show) => (
              <button
                key={show.id}
                type="button"
                onClick={() => selectFromTMDB(show)}
                className="flex w-full items-center gap-3 border-b border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 last:border-0 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {getPosterUrl(show.posterPath) ? (
                  <div className="relative h-12 w-8">
                    <Image
                      src={getPosterUrl(show.posterPath)!}
                      alt={show.name}
                      fill
                      className="rounded object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                )}

                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {show.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {show.firstAirDate?.split("-")[0] || "Unknown"} •{" "}
                    {show.totalSeasons || "?"} seasons
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-gray-500">Searching...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected TMDB Preview */}
      {selectedFromTMDB && (
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            ✓ Added from TMDB: {selectedFromTMDB.name}
            {selectedFromTMDB.overview && (
              <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                {selectedFromTMDB.overview.substring(0, 100)}...
              </span>
            )}
          </p>
        </div>
      )}

      <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Series Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
            errors.name
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="Enter series name"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Total Seasons <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={totalSeasons === null ? "" : totalSeasons}
          onChange={handleTotalSeasonsChange}
          disabled={isSubmitting}
          min={1}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
            errors.totalSeasons
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="Enter number of seasons"
        />
        {errors.totalSeasons && (
          <p className="mt-1 text-xs text-red-500">{errors.totalSeasons}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Any Upcoming Season? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasUpcoming"
              value="yes"
              checked={hasUpcoming === true}
              onChange={() => setHasUpcoming(true)}
              disabled={isSubmitting}
              className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Yes
            </span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasUpcoming"
              value="no"
              checked={hasUpcoming === false}
              onChange={() => setHasUpcoming(false)}
              disabled={isSubmitting}
              className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
          </label>
        </div>
        {errors.hasUpcoming && (
          <p className="mt-1 text-xs text-red-500">{errors.hasUpcoming}</p>
        )}
        {hasUpcoming === true && !errors.hasUpcoming && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            Season {totalSeasons ? totalSeasons + 1 : "?"} will be added as
            upcoming
          </p>
        )}
        {hasUpcoming === false && !errors.hasUpcoming && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Series will be marked as ended
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Series"}
        </button>
        <button
          type="button"
          onClick={() => {
            setName("");
            setTotalSeasons(null);
            setHasUpcoming(null);
            setSelectedFromTMDB(null);
            setSearchQuery("");
            setErrors({});
          }}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddSeriesForm;
