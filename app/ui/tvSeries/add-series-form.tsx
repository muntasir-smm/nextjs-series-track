// app/ui/tvSeries/add-series-form.tsx

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface TMDBResult {
  id: number;
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

// Safe array comparison utility
const arraysEqual = (a?: boolean[], b?: boolean[]): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const AddSeriesForm: React.FC<AddSeriesFormProps> = ({
  addSeries,
  isSubmitting = false,
}) => {
  // Form state
  const [name, setName] = useState("");
  const [totalSeasons, setTotalSeasons] = useState<number | null>(null);
  const [hasUpcoming, setHasUpcoming] = useState<boolean | null>(null);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  // TMDB Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFromTMDB, setSelectedFromTMDB] = useState<TMDBResult | null>(
    null,
  );

  // Refs for abort controller
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const [errors, setErrors] = useState<{
    name?: string;
    totalSeasons?: string;
    hasUpcoming?: string;
  }>({});

  // Memoized poster URL helper
  const getPosterUrl = useCallback(
    (posterPath: string | null, size: string = "w92") => {
      if (!posterPath) return null;
      return `https://image.tmdb.org/t/p/${size}${posterPath}`;
    },
    [],
  );

  // Memoized upcoming season text
  const upcomingSeasonText = useMemo(() => {
    if (hasUpcoming !== true) return null;
    return `Season ${totalSeasons ? totalSeasons + 1 : "?"} will be added as upcoming`;
  }, [hasUpcoming, totalSeasons]);

  // Debounced search with abort controller
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setIsSearching(true);

        const response = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );

        const data = await response.json();

        // Only update if not aborted
        if (!controller.signal.aborted) {
          setSearchResults(data.series || []);
          setShowResults(true);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Search failed:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery]);

  // Close search results on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".tmdb-search-container")) {
        setShowResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const selectFromTMDB = async (show: TMDBResult) => {
    setName(show.name);
    setTotalSeasons(show.totalSeasons || 0);
    setSelectedFromTMDB(show);
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
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

  const resetForm = () => {
    setName("");
    setTotalSeasons(null);
    setHasUpcoming(null);
    setSelectedFromTMDB(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocalSubmitting || isSubmitting) return;
    if (!validateForm()) return;

    try {
      setIsLocalSubmitting(true);

      let upcomingSeasons: string[] = [];

      if (hasUpcoming === true) {
        const nextSeasonNumber = (totalSeasons as number) + 1;
        upcomingSeasons = [`Season ${nextSeasonNumber}`];
      }

      await addSeries(
        name,
        totalSeasons as number,
        upcomingSeasons,
        selectedFromTMDB?.posterPath,
        selectedFromTMDB?.backdropPath,
        selectedFromTMDB?.overview,
      );

      resetForm();
    } catch (error) {
      console.error("Error adding series:", error);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const handleTotalSeasonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setTotalSeasons(null);
    } else {
      const numValue = parseInt(value);
      setTotalSeasons(isNaN(numValue) ? null : Math.max(1, numValue));
    }
  };

  const isSubmitDisabled = isLocalSubmitting || isSubmitting;
  const submitButtonText =
    isLocalSubmitting || isSubmitting ? "Adding..." : "Add Series";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TMDB Search Section */}
      <div className="relative tmdb-search-container">
        <label
          htmlFor="tmdb-search"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Search from TMDB
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="tmdb-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search series..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-8 text-sm outline-none focus:border-blue-500 focus:bg-green-100 focus:text-black focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && !isSearching && searchResults.length === 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No series found
            </p>
          </div>
        )}

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
                  <div className="relative h-12 w-8 flex-shrink-0">
                    <Image
                      src={getPosterUrl(show.posterPath)!}
                      alt={show.name}
                      fill
                      className="rounded object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-8 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
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
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </span>
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

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Series Name Input */}
      <div>
        <label
          htmlFor="series-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Series Name <span className="text-red-500">*</span>
        </label>
        <input
          id="series-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitDisabled}
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

      {/* Total Seasons Input */}
      <div>
        <label
          htmlFor="total-seasons"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Total Seasons <span className="text-red-500">*</span>
        </label>
        <input
          id="total-seasons"
          type="number"
          value={totalSeasons === null ? "" : totalSeasons}
          onChange={handleTotalSeasonsChange}
          disabled={isSubmitDisabled}
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

      {/* Upcoming Season Selection */}
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
              disabled={isSubmitDisabled}
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
              disabled={isSubmitDisabled}
              className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
          </label>
        </div>
        {errors.hasUpcoming && (
          <p className="mt-1 text-xs text-red-500">{errors.hasUpcoming}</p>
        )}
        {upcomingSeasonText && !errors.hasUpcoming && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            {upcomingSeasonText}
          </p>
        )}
        {hasUpcoming === false && !errors.hasUpcoming && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Series will be marked as ended
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitDisabled ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{submitButtonText}</span>
            </div>
          ) : (
            submitButtonText
          )}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={isSubmitDisabled}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddSeriesForm;
