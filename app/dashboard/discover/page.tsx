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
  );
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const searchTMDB = useCallback(
    async (query: string, page: number = 1, append: boolean = false) => {
      try {
        if (!query.trim()) {
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

  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    setIsSearching(true);
    setCurrentPage(1);
    await searchTMDB(query, 1, false);
    setIsSearching(false);
  }, 500);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    await searchTMDB(searchQuery, nextPage, true);
    setCurrentPage(nextPage);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, currentPage, searchQuery, searchTMDB]);

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      await searchTMDB("", 1, false);
      setIsLoading(false);
    };
    loadInitial();
  }, [searchTMDB]);

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

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isSearching, loadMore]);

  const handleAddSeries = async (seriesItem: Series) => {
    setAddingSeriesId(seriesItem.id);
    try {
      const result = await addSeriesAction(
        seriesItem.tmdbId,
        seriesItem.name,
        seriesItem.totalSeasons,
        [],
        seriesItem.posterPath,
        seriesItem.backdropPath,
        seriesItem.overview,
        seriesItem.voteAverage,
        0,
        seriesItem.firstAirDate,
        null,
        seriesItem.genres,
      );
      if (result.success) {
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

  const availableSeries = Array.isArray(allSeries)
    ? allSeries.filter((s) => !userSeriesTmdbIds.has(s.tmdbId))
    : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Loading amazing series...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 hover:scale-105 md:bottom-8"
          aria-label="Go to top"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/40">
            <SparklesIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Discover Series
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Explore {totalResults.toLocaleString()}+ TV series from TMDB
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for any TV series..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search status */}
      {isSearching && (
        <div className="flex items-center justify-center gap-2 py-3">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-brand-500" />
          <span className="text-sm text-slate-500">Searching...</span>
        </div>
      )}

      {/* Results info */}
      {!isSearching && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {searchQuery ? (
            <>
              Found{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {totalResults.toLocaleString()}
              </span>{" "}
              results for &ldquo;{searchQuery}&rdquo;
            </>
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {availableSeries.length}
              </span>{" "}
              of {totalResults.toLocaleString()} popular series
            </>
          )}
        </p>
      )}

      {/* Grid */}
      {availableSeries.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {availableSeries.map((seriesItem) => (
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
                isAdding={addingSeriesId === seriesItem.id}
                onAdd={() => handleAddSeries(seriesItem)}
              />
            ))}
          </div>

          <div ref={loadMoreRef} className="py-8 text-center">
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="h-5 w-5 animate-spin text-brand-500" />
                <span className="text-sm text-slate-500">
                  Loading more series...
                </span>
              </div>
            )}
            {!hasMore && !isSearching && availableSeries.length > 0 && (
              <p className="text-sm text-slate-400">
                You&apos;ve explored all {totalResults.toLocaleString()} series
              </p>
            )}
            {hasMore && !isLoadingMore && !isSearching && (
              <button
                onClick={loadMore}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Load More
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <SparklesIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            No series found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search.`
              : "All popular series are already in your collection."}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
