"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TvIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getUserSeries } from "@/app/lib/series";

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
    tmdbId: number,
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
    posterPath?: string | null,
    backdropPath?: string | null,
    overview?: string | null,
  ) => Promise<{
    success?: boolean;
    error?: string;
    duplicate?: boolean;
  } | void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const AddSeriesForm: React.FC<AddSeriesFormProps> = ({
  addSeries,
  isSubmitting = false,
  onCancel,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<TMDBResult | null>(null);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existingTmdbIds, setExistingTmdbIds] = useState<Set<number>>(
    new Set(),
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch existing series TMDB IDs
  useEffect(() => {
    const loadExistingSeries = async () => {
      try {
        const series = await getUserSeries();
        const tmdbIds = new Set(
          series
            .map((s) => s.tmdbId)
            .filter((id): id is number => id !== undefined && id !== null),
        );
        setExistingTmdbIds(tmdbIds);
      } catch (error) {
        console.error("Error loading existing series:", error);
      }
    };
    loadExistingSeries();
  }, []);

  const getPosterUrl = (posterPath: string | null, size: string = "w92") => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

  // Check duplicate by TMDB ID only
  const isDuplicateSeries = (tmdbId: number): boolean => {
    return existingTmdbIds.has(tmdbId);
  };

  const selectSeries = (series: TMDBResult) => {
    setSelectedSeries(series);
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
    setDuplicateError(null);
  };

  const isDuplicateSelected = selectedSeries
    ? isDuplicateSeries(selectedSeries.id)
    : false;

  // Debounced search
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

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

        if (!controller.signal.aborted) {
          const results = (data.series || []).map((show: any) => ({
            id: show.id,
            name: show.name,
            totalSeasons: show.totalSeasons || 0,
            overview: show.overview,
            posterPath: show.posterPath,
            backdropPath: show.backdropPath,
            firstAirDate: show.firstAirDate,
            voteAverage: show.voteAverage,
          }));
          setSearchResults(results);
          setShowResults(true);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Search failed:", error);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;
    if (isLocalSubmitting || isSubmitting) return;

    if (isDuplicateSelected) {
      setDuplicateError(
        `"${selectedSeries.name}" is already in your collection!`,
      );
      return;
    }

    try {
      setIsLocalSubmitting(true);

      const result = await addSeries(
        selectedSeries.id,
        selectedSeries.name,
        selectedSeries.totalSeasons,
        [],
        selectedSeries.posterPath,
        selectedSeries.backdropPath,
        selectedSeries.overview,
      );

      if (result?.duplicate) {
        setDuplicateError(result.error || "Series already exists");
        return;
      }

      if (result?.success) {
        // Add to existing TMDB IDs set
        setExistingTmdbIds((prev) => new Set([...prev, selectedSeries.id]));
        setSuccessMessage(`${selectedSeries.name} added successfully!`);
        setTimeout(() => {
          setSuccessMessage(null);
          setSelectedSeries(null);
          if (onCancel) onCancel();
        }, 1500);
      }
    } catch (error) {
      console.error("Error adding series:", error);
      setDuplicateError("Failed to add series. Please try again.");
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isLocalSubmitting || isSubmitting || !selectedSeries || isDuplicateSelected;

  // Get series display name with year
  const getSeriesDisplayName = (series: TMDBResult): string => {
    const year = series.firstAirDate?.split("-")[0];
    return year ? `${series.name} (${year})` : series.name;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Section */}
      <div className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a TV series..."
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {searchResults.map((show) => {
              // Check by TMDB ID only - this disables the button and shows the badge
              const alreadyExists = isDuplicateSeries(show.id);
              const displayName = getSeriesDisplayName(show);

              return (
                <button
                  key={show.id}
                  type="button"
                  onClick={() => !alreadyExists && selectSeries(show)}
                  disabled={alreadyExists}
                  className={`flex w-full items-center gap-3 border-b border-gray-100 p-4 text-left transition-all last:border-0 ${
                    alreadyExists
                      ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {getPosterUrl(show.posterPath) ? (
                    <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={getPosterUrl(show.posterPath)!}
                        alt={show.name}
                        width={40}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                      <TvIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {displayName}
                      </span>
                      {show.voteAverage > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <StarSolidIcon className="h-3 w-3" />
                          {show.voteAverage.toFixed(1)}
                        </span>
                      )}
                      {alreadyExists && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          Already Added
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {show.firstAirDate?.split("-")[0] || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <TvIcon className="h-3 w-3" />
                        {show.totalSeasons || "?"} seasons
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isSearching && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white p-6 text-center shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Series Preview */}
      <AnimatePresence>
        {selectedSeries && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`overflow-hidden rounded-xl p-4 border ${
              isDuplicateSelected
                ? "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-800"
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800"
            }`}
          >
            <div className="flex gap-3">
              {getPosterUrl(selectedSeries.posterPath, "w92") ? (
                <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg shadow">
                  <Image
                    src={getPosterUrl(selectedSeries.posterPath, "w92")!}
                    alt={selectedSeries.name}
                    width={44}
                    height={64}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-11 items-center justify-center rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <TvIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getSeriesDisplayName(selectedSeries)}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <StarSolidIcon className="h-3 w-3" />
                    {selectedSeries.voteAverage.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {selectedSeries.totalSeasons} seasons
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {duplicateError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-red-50 p-3 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
          >
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {duplicateError}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`flex-1 rounded-xl py-3 text-white font-semibold text-sm transition-all shadow-lg ${
            isDuplicateSelected
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          }`}
        >
          {isLocalSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Adding...</span>
            </div>
          ) : isDuplicateSelected ? (
            <span>Already in Collection</span>
          ) : (
            <span>Add to Collection</span>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border-2 border-gray-300 bg-white py-3 text-gray-700 font-semibold text-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddSeriesForm;
