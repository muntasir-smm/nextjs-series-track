// app/dashboard/discover/page.tsx

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowUpIcon,
  FilmIcon,
  TvIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  addSeries as addSeriesAction,
  addMovie as addMovieAction,
  getUserSeries,
} from "@/app/lib/series";
import { useDebouncedCallback } from "use-debounce";
import Image from "next/image";
import clsx from "clsx";

type MediaTypeFilter = "tv" | "movie";

interface DiscoverItem {
  id: string;
  tmdbId: number;
  mediaType: MediaTypeFilter;
  name: string;
  overview?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  firstAirDate?: string | null;
  releaseDate?: string | null;
  totalSeasons?: number;
  genres?: string[];
}

function libraryKey(mediaType: string, tmdbId: number) {
  return `${mediaType}:${tmdbId}`;
}

export default function DiscoverPage() {
  const [mediaType, setMediaType] = useState<MediaTypeFilter>("tv");
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [inLibrary, setInLibrary] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadLibraryKeys = useCallback(async () => {
    try {
      const lib = await getUserSeries();
      const keys = new Set(
        lib
          .filter((s) => s.tmdbId != null)
          .map((s) => libraryKey(s.mediaType || "tv", s.tmdbId as number)),
      );
      setInLibrary(keys);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadLibraryKeys();
  }, [loadLibraryKeys]);

  const normalizeResults = (
    data: any,
    type: MediaTypeFilter,
  ): DiscoverItem[] => {
    const raw =
      data.results || data.series || (Array.isArray(data) ? data : []);

    return raw.map((item: any) => {
      const mt = item.mediaType || item.media_type || type;
      const tmdbId = Number(item.tmdbId ?? item.id);
      return {
        id: String(tmdbId),
        tmdbId,
        mediaType: mt === "movie" ? "movie" : "tv",
        name: item.name || item.title,
        overview: item.overview || "",
        posterPath: item.posterPath ?? item.poster_path,
        backdropPath: item.backdropPath ?? item.backdrop_path,
        voteAverage: item.voteAverage ?? item.vote_average ?? 0,
        firstAirDate: item.firstAirDate ?? item.first_air_date ?? null,
        releaseDate: item.releaseDate ?? item.release_date ?? null,
        totalSeasons: item.totalSeasons ?? item.number_of_seasons ?? 0,
        genres: item.genres || [],
      };
    });
  };

  const fetchPage = useCallback(
    async (
      query: string,
      page: number,
      type: MediaTypeFilter,
      append: boolean,
    ) => {
      let url: string;
      if (query.trim()) {
        url = `/api/tmdb/search?query=${encodeURIComponent(query)}&page=${page}&type=${type}`;
      } else if (type === "movie") {
        url = `/api/tmdb/movie/popular?page=${page}`;
      } else {
        url = `/api/tmdb/popular?page=${page}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      const next = normalizeResults(data, type);

      setItems((prev) => (append ? [...prev, ...next] : next));
      setTotalPages(data.totalPages || data.total_pages || 1);
      setTotalResults(data.totalResults || data.total_results || 0);
      setHasMore(page < (data.totalPages || data.total_pages || 1));
    },
    [],
  );

  const debouncedSearch = useDebouncedCallback(
    async (query: string, type: MediaTypeFilter) => {
      setIsSearching(true);
      setCurrentPage(1);
      try {
        await fetchPage(query, 1, type, false);
      } finally {
        setIsSearching(false);
      }
    },
    500,
  );

  // Initial + tab change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setCurrentPage(1);
      setSearchQuery("");
      try {
        if (!cancelled) await fetchPage("", 1, mediaType, false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mediaType, fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    await fetchPage(searchQuery, nextPage, mediaType, true);
    setCurrentPage(nextPage);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, currentPage, searchQuery, mediaType, fetchPage]);

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

  /** Fetch full details then add — never trust search-only payload */
  const handleAdd = async (item: DiscoverItem) => {
    const key = libraryKey(item.mediaType, item.tmdbId);
    if (inLibrary.has(key)) {
      setMessage("Already in your library");
      return;
    }

    setAddingId(item.id);
    setMessage(null);

    try {
      if (item.mediaType === "movie") {
        const res = await fetch(`/api/tmdb/movie/${item.tmdbId}`);
        if (!res.ok) throw new Error("Failed to load movie details");
        const d = await res.json();

        const result = await addMovieAction({
          tmdbId: d.id,
          name: d.name,
          overview: d.overview,
          posterPath: d.posterPath,
          backdropPath: d.backdropPath,
          voteAverage: d.voteAverage,
          voteCount: d.voteCount,
          releaseDate: d.releaseDate,
          runtime: d.runtime,
          genres: d.genres,
          status: d.status,
          tagline: d.tagline,
          originalName: d.originalName,
          originalLanguage: d.originalLanguage,
          popularity: d.popularity,
        });

        if (result.duplicate) {
          setMessage(result.error || "Already in your library");
          setInLibrary((prev) => new Set(prev).add(key));
        } else if (result.success) {
          setInLibrary((prev) => new Set(prev).add(key));
          setMessage(`Added “${d.name}”`);
        } else {
          setMessage(result.error || "Failed to add");
        }
      } else {
        const res = await fetch(`/api/tmdb/tv/${item.tmdbId}`);
        if (!res.ok) throw new Error("Failed to load TV details");
        const d = await res.json();

        const result = await addSeriesAction(
          d.id,
          d.name,
          d.totalSeasons || 0,
          [],
          d.posterPath,
          d.backdropPath,
          d.overview,
          d.voteAverage,
          d.voteCount,
          d.firstAirDate,
          d.lastAirDate,
          d.genres,
          d.status,
          d.tagline,
          d.originalName,
          d.originalLanguage,
          d.popularity,
          d.inProduction,
          d.networks,
          d.totalEpisodes,
          d.seasons,
        );

        if (result.duplicate) {
          setMessage(result.error || "Already in your library");
          setInLibrary((prev) => new Set(prev).add(key));
        } else if (result.success) {
          setInLibrary((prev) => new Set(prev).add(key));
          setMessage(`Added “${d.name}”`);
        } else {
          setMessage(result.error || "Failed to add");
        }
      }
    } catch (e) {
      console.error(e);
      setMessage("Failed to add. Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  const visible = items.filter(
    (i) => !inLibrary.has(libraryKey(i.mediaType, i.tmdbId)),
  );

  return (
    <div className="space-y-6">
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg md:bottom-8"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/40">
            <SparklesIcon className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Discover
            </h1>
            <p className="text-sm text-slate-500">
              Browse and add movies &amp; TV series
            </p>
          </div>
        </div>

        {/* Media type tabs */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMediaType("tv")}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
              mediaType === "tv"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
            )}
          >
            <TvIcon className="h-4 w-4" />
            TV
          </button>
          <button
            type="button"
            onClick={() => setMediaType("movie")}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
              mediaType === "movie"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
            )}
          >
            <FilmIcon className="h-4 w-4" />
            Movies
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {message}
          <button
            type="button"
            className="ml-3 text-brand-600 hover:underline"
            onClick={() => setMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            debouncedSearch(e.target.value, mediaType);
          }}
          placeholder={
            mediaType === "movie" ? "Search movies..." : "Search TV series..."
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
              fetchPage("", 1, mediaType, false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-brand-500" />
          Searching...
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
        </div>
      ) : visible.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visible.map((item) => {
              const poster = item.posterPath
                ? `https://image.tmdb.org/t/p/w342${item.posterPath}`
                : null;
              const year = item.releaseDate || item.firstAirDate;
              const yearLabel = year ? new Date(year).getFullYear() : null;
              const isAdding = addingId === item.id;

              return (
                <div
                  key={`${item.mediaType}-${item.tmdbId}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="relative aspect-[2/3] bg-slate-100 dark:bg-slate-800">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 50vw, 16vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-400">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    {item.voteAverage != null && item.voteAverage > 0 && (
                      <span className="absolute right-2 top-2 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
                        ★ {item.voteAverage.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {yearLabel ||
                        (item.mediaType === "movie" ? "Movie" : "TV")}
                    </p>
                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={() => handleAdd(item)}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-brand-600 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                    >
                      {isAdding ? (
                        <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <PlusIcon className="h-3.5 w-3.5" />
                      )}
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={loadMoreRef} className="py-8 text-center">
            {isLoadingMore && (
              <ArrowPathIcon className="mx-auto h-5 w-5 animate-spin text-brand-500" />
            )}
            {hasMore && !isLoadingMore && (
              <button
                type="button"
                onClick={loadMore}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Load more
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <p className="text-slate-500">
            {searchQuery
              ? "No results. Try another search."
              : "Everything here is already in your library."}
          </p>
        </div>
      )}
    </div>
  );
}
