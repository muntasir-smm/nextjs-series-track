// app/dashboard/discover/page.tsx

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { addSeries as addSeriesAction, getUserSeries } from "@/app/lib/series";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import SeriesCard from "@/app/ui/series-card";

interface Series {
  id: string;
  tmdbId: number;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  firstAirDate?: string | null;
  overview?: string | null;
  genres?: string[];
}

export default function DiscoverPage() {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [userSeriesTmdbIds, setUserSeriesTmdbIds] = useState<Set<number>>(
    new Set(),
  ); // CHANGE to Set of numbers
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [addingSeriesId, setAddingSeriesId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search function that uses TMDB API directly
  const searchTMDB = useCallback(
    async (query: string, page: number = 1, append: boolean = false) => {
      try {
        if (!query.trim()) {
          // Load popular series if no search query
          const res = await fetch(`/api/tmdb/popular?page=${page}`);
          const data = await res.json();
          const newSeries = Array.isArray(data.series) ? data.series : [];

          if (append) {
            setAllSeries((prev) => [...prev, ...newSeries]);
          } else {
            setAllSeries(newSeries);
          }
          setTotalPages(data.totalPages || 1);
          setTotalResults(data.totalResults || 0);
          setHasMore(page < (data.totalPages || 1));
          return data;
        }

        const res = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`,
        );
        const data = await res.json();
        const newSeries = Array.isArray(data.series) ? data.series : [];

        if (append) {
          setAllSeries((prev) => [...prev, ...newSeries]);
        } else {
          setAllSeries(newSeries);
        }
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || 0);
        setHasMore(page < (data.totalPages || 1));
        return data;
      } catch (error) {
        console.error("Search error:", error);
        return { series: [] };
      }
    },
    [],
  );

  // Debounced search
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    setIsSearching(true);
    setCurrentPage(1);
    await searchTMDB(query, 1, false);
    setIsSearching(false);
  }, 500);

  // Load more series
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    await searchTMDB(searchQuery, nextPage, true);
    setCurrentPage(nextPage);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, currentPage, searchQuery, searchTMDB]);

  // Load initial popular series
  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      await searchTMDB("", 1, false);
      setIsLoading(false);
    };
    loadInitial();
  }, [searchTMDB]);

  // Load user's series - get TMDB IDs instead of string IDs
  useEffect(() => {
    const loadUserSeries = async () => {
      try {
        const userSeries = await getUserSeries();
        const tmdbIds = new Set(
          userSeries
            .map((s) => s.tmdbId)
            .filter((id): id is number => id !== undefined && id !== null),
        );
        setUserSeriesTmdbIds(tmdbIds);
      } catch (error) {
        console.error("Error loading user series:", error);
      }
    };
    loadUserSeries();
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isSearching
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isSearching, loadMore]);

  const handleAddSeries = async (seriesItem: Series) => {
    setAddingSeriesId(seriesItem.id);
    try {
      // FIXED: Pass tmdbId as first parameter (number)
      const result = await addSeriesAction(
        seriesItem.tmdbId, // TMDB ID as number
        seriesItem.name,
        seriesItem.totalSeasons,
        [],
        seriesItem.posterPath,
        seriesItem.backdropPath,
        seriesItem.overview,
        seriesItem.voteAverage,
        0, // voteCount (optional)
        seriesItem.firstAirDate,
        null, // lastAirDate
        seriesItem.genres,
        undefined, // status
        undefined, // tagline
        undefined, // originalName
        undefined, // originalLanguage
        undefined, // popularity
        undefined, // inProduction
        undefined, // networks
        undefined, // totalEpisodes
        undefined, // seasons
      );
      if (result.success) {
        // Add TMDB ID to the set
        setUserSeriesTmdbIds((prev) => new Set([...prev, seriesItem.tmdbId]));
      }
    } catch (error) {
      console.error("Error adding series:", error);
    } finally {
      setAddingSeriesId(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    searchTMDB("", 1, false);
  };

  // Filter out series already in user's collection using TMDB ID
  const availableSeries = Array.isArray(allSeries)
    ? allSeries.filter((s) => !userSeriesTmdbIds.has(s.tmdbId))
    : [];

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
      {/* Go to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-500 p-3 text-white shadow-lg transition-all hover:bg-blue-600 hover:scale-110"
          aria-label="Go to top"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      )}

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
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {searchQuery ? (
            <>
              Found{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalResults.toLocaleString()}
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
              of {totalResults.toLocaleString()} popular series
            </>
          )}
        </div>
      )}

      {/* Series Grid */}
      {availableSeries.length > 0 ? (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {availableSeries.map((seriesItem) => {
              const isAdding = addingSeriesId === seriesItem.id;

              return (
                <SeriesCard
                  key={seriesItem.id}
                  id={seriesItem.id}
                  name={seriesItem.name}
                  totalSeasons={seriesItem.totalSeasons}
                  posterPath={seriesItem.posterPath}
                  voteAverage={seriesItem.voteAverage}
                  firstAirDate={seriesItem.firstAirDate}
                  overview={seriesItem.overview}
                  genres={seriesItem.genres}
                  isAdding={isAdding}
                  onAdd={() => handleAddSeries(seriesItem)}
                />
              );
            })}
          </div>

          {/* Load More Trigger */}
          <div ref={loadMoreRef} className="py-8 text-center">
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm text-gray-500">
                  Loading more series...
                </span>
              </div>
            )}
            {!hasMore && !isSearching && availableSeries.length > 0 && (
              <p className="text-sm text-gray-400">
                🎉 You have explored all {totalResults.toLocaleString()} series!
              </p>
            )}
            {hasMore && !isLoadingMore && !isSearching && (
              <button
                onClick={loadMore}
                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600"
              >
                Load More
              </button>
            )}
          </div>
        </>
      ) : (
        // Empty State
        <div className="rounded-xl bg-white p-12 text-center shadow-sm dark:bg-gray-800">
          <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-700">
            <SparklesIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            {searchQuery ? "No series found" : "No series to discover"}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchQuery
              ? `No TV series match "${searchQuery}". Try a different search term.`
              : "Check back later for new series!"}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
