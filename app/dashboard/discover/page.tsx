// app/dashboard/discover/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PlusIcon,
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { addSeries as addSeriesAction, getUserSeries } from "@/app/lib/series";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";

interface Series {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  firstAirDate?: string;
  overview?: string;
}

export default function DiscoverPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [userSeriesIds, setUserSeriesIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [addingSeriesId, setAddingSeriesId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Search function that uses TMDB API directly
  const searchTMDB = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      // Load popular series if no search query
      const res = await fetch(`/api/tmdb/popular?page=${page}&limit=20`);
      const data = await res.json();
      setSeries(data.series || []);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || 0);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`,
      );
      const data = await res.json();
      setSeries(data.series || []);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || 0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useDebouncedCallback((query: string) => {
    setCurrentPage(1);
    searchTMDB(query, 1);
  }, 500);

  // Load user's series
  useEffect(() => {
    const loadUserSeries = async () => {
      try {
        const userSeries = await getUserSeries();
        setUserSeriesIds(new Set(userSeries.map((s) => s.id)));
      } catch (error) {
        console.error("Error loading user series:", error);
      }
    };
    loadUserSeries();
  }, []);

  // Load initial popular series
  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      await searchTMDB("", 1);
      setIsLoading(false);
    };
    loadInitial();
  }, [searchTMDB]);

  // Handle page change
  useEffect(() => {
    if (!isLoading) {
      searchTMDB(searchQuery, currentPage);
    }
  }, [currentPage, searchTMDB, searchQuery, isLoading]);

  const handleAddSeries = async (seriesItem: Series) => {
    setAddingSeriesId(seriesItem.id);
    try {
      const result = await addSeriesAction(
        seriesItem.name,
        seriesItem.totalSeasons,
        [],
        seriesItem.posterPath,
        seriesItem.backdropPath,
        seriesItem.overview,
      );
      if (result.success) {
        setUserSeriesIds((prev) => new Set([...prev, seriesItem.id]));
      }
    } catch (error) {
      console.error("Error adding series:", error);
    } finally {
      setAddingSeriesId(null);
    }
  };

  const getPosterUrl = (
    posterPath: string | null | undefined,
    size: string = "w342",
  ) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

  const formatYear = (dateString: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).getFullYear();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    searchTMDB("", 1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter out series already in user's collection
  const availableSeries = series.filter((s) => !userSeriesIds.has(s.id));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading amazing series...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-7 w-7 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Discover Series
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Explore {totalResults.toLocaleString()}+ TV series from TMDB
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for any TV series (e.g., Breaking Bad, Stranger Things)..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Status */}
      {isSearching && (
        <div className="flex items-center justify-center py-4">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-gray-500">Searching...</span>
        </div>
      )}

      {/* Results Info */}
      {!isSearching && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {searchQuery ? (
              <>
                Found{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {availableSeries.length}
                </span>{" "}
                results for &ldquo;
                <span className="font-medium">{searchQuery}</span>&rdquo;
              </>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {availableSeries.length}
                </span>{" "}
                popular series
              </>
            )}
          </div>
          {totalPages > 1 && (
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      )}

      {/* Series Grid */}
      {availableSeries.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {availableSeries.map((seriesItem) => {
            const posterUrl = getPosterUrl(seriesItem.posterPath);
            const isAdding = addingSeriesId === seriesItem.id;

            return (
              <div
                key={seriesItem.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={seriesItem.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <span className="text-4xl font-bold text-white">
                        {seriesItem.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Rating Badge */}
                  {seriesItem.voteAverage && seriesItem.voteAverage > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
                      <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {seriesItem.voteAverage.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Content - Flex column to push button to bottom */}
                <div className="flex flex-1 flex-col p-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {seriesItem.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{seriesItem.totalSeasons || "?"} seasons</span>
                      <span>•</span>
                      <span>{formatYear(seriesItem.firstAirDate || "")}</span>
                    </div>

                    {seriesItem.overview && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {seriesItem.overview}
                      </p>
                    )}
                  </div>

                  {/* Button at bottom */}
                  <button
                    onClick={() => handleAddSeries(seriesItem)}
                    disabled={isAdding}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-md disabled:opacity-50"
                  >
                    {isAdding ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        Add to My Series
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="rounded-xl bg-white p-12 text-center shadow-sm dark:bg-gray-800">
          <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-700">
            <SparklesIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            {searchQuery ? "No series found" : "No more series to discover"}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchQuery
              ? `No TV series match "${searchQuery}". Try a different search term.`
              : "You've added all available series to your collection! Check back later for more."}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
            >
              Clear Search
            </button>
          )}
          {!searchQuery && (
            <Link
              href="/dashboard/tvSeries"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600"
            >
              View your collection →
            </Link>
          )}
        </div>
      )}

      {/* Pagination - Modern Design */}
      {totalPages > 1 && !isSearching && availableSeries.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-all hover:bg-gray-100 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <div className="flex gap-1">
            {(() => {
              const pages = [];
              const maxVisible = 5;
              let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisible / 2),
              );
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);

              if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              if (startPage > 1) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => goToPage(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    1
                  </button>,
                );
                if (startPage > 2) {
                  pages.push(
                    <span
                      key="start-dots"
                      className="flex h-9 w-9 items-center justify-center text-gray-500"
                    >
                      ...
                    </span>,
                  );
                }
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      currentPage === i
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {i}
                  </button>,
                );
              }

              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span
                      key="end-dots"
                      className="flex h-9 w-9 items-center justify-center text-gray-500"
                    >
                      ...
                    </span>,
                  );
                }
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => goToPage(totalPages)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {totalPages}
                  </button>,
                );
              }

              return pages;
            })()}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-all hover:bg-gray-100 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
