// app/ui/tvSeries/add-series-form.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TvIcon,
  FilmIcon,
  CalendarIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  getUserSeries,
  addSeries as addSeriesAction,
  addMovie as addMovieAction,
  type MediaType,
} from "@/app/lib/series";
import { formatRating } from "@/app/lib/format";

type SearchFilter = "all" | MediaType;

interface SearchResult {
  id: number;
  mediaType: MediaType;
  name: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  date: string | null;
  voteAverage: number;
  totalSeasons?: number;
}

interface AddSeriesFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
  isSubmitting?: boolean;
}

function libraryKey(mediaType: MediaType, tmdbId: number) {
  return `${mediaType}:${tmdbId}`;
}

const AddSeriesForm: React.FC<AddSeriesFormProps> = ({
  onSuccess,
  onCancel,
  onError,
  isSubmitting: externalSubmitting = false,
}) => {
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [libraryKeys, setLibraryKeys] = useState<Set<string>>(new Set());

  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const load = async () => {
      try {
        const series = await getUserSeries();
        setLibraryKeys(
          new Set(
            series
              .filter((s) => s.tmdbId != null)
              .map((s) =>
                libraryKey(
                  (s.mediaType || "tv") as MediaType,
                  s.tmdbId as number,
                ),
              ),
          ),
        );
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setSelected(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setDuplicateError(null);
  }, [filter]);

  const getPosterUrl = (posterPath: string | null, size = "w92") => {
    if (!posterPath) return null;
    if (posterPath.startsWith("http")) return posterPath;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

  const isInLibrary = (item: SearchResult) =>
    libraryKeys.has(libraryKey(item.mediaType, item.id));

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
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
        const typeParam =
          filter === "all" ? "multi" : filter === "movie" ? "movie" : "tv";

        const res = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(q)}&type=${typeParam}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        if (controller.signal.aborted) return;

        const raw =
          data.results || data.series || (Array.isArray(data) ? data : []);

        const results: SearchResult[] = raw
          .map((item: any) => {
            const mt: MediaType =
              item.mediaType === "movie" || item.media_type === "movie"
                ? "movie"
                : item.mediaType === "tv" || item.media_type === "tv"
                  ? "tv"
                  : filter === "movie"
                    ? "movie"
                    : "tv";

            // Skip people if any slip through
            if (item.media_type === "person" || item.mediaType === "person") {
              return null;
            }

            return {
              id: Number(item.tmdbId ?? item.id),
              mediaType: mt,
              name: item.name || item.title || "Unknown",
              overview: item.overview || "",
              posterPath: item.posterPath ?? item.poster_path ?? null,
              backdropPath: item.backdropPath ?? item.backdrop_path ?? null,
              date:
                item.releaseDate ||
                item.release_date ||
                item.firstAirDate ||
                item.first_air_date ||
                null,
              voteAverage: Number(item.voteAverage ?? item.vote_average ?? 0),
              totalSeasons:
                item.totalSeasons ?? item.number_of_seasons ?? undefined,
            } as SearchResult;
          })
          .filter(Boolean) as SearchResult[];

        setSearchResults(results);
        setShowResults(true);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          console.error("Search failed:", e);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchQuery, filter]);

  const selectItem = (item: SearchResult) => {
    if (isInLibrary(item)) return;
    setSelected(item);
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
    setDuplicateError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (isLocalSubmitting || externalSubmitting) return;

    if (isInLibrary(selected)) {
      const msg = `"${selected.name}" is already in your library`;
      setDuplicateError(msg);
      onError?.(msg);
      return;
    }

    setIsLocalSubmitting(true);
    setDuplicateError(null);

    try {
      if (selected.mediaType === "movie") {
        const res = await fetch(`/api/tmdb/movie/${selected.id}`);
        if (!res.ok) throw new Error("Failed to load movie details");
        const d = await res.json();

        const result = await addMovieAction({
          tmdbId: d.id,
          name: d.name || d.title,
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
          const msg = result.error || "Already in your library";
          setDuplicateError(msg);
          onError?.(msg);
          setLibraryKeys((prev) =>
            new Set(prev).add(libraryKey("movie", selected.id)),
          );
          return;
        }

        if (!result.success) {
          const msg = result.error || "Failed to add movie";
          setDuplicateError(msg);
          onError?.(msg);
          return;
        }

        setLibraryKeys((prev) =>
          new Set(prev).add(libraryKey("movie", selected.id)),
        );
        setSuccessMessage(`${d.name || selected.name} added!`);
      } else {
        const res = await fetch(`/api/tmdb/tv/${selected.id}`);
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
          const msg = result.error || "Already in your library";
          setDuplicateError(msg);
          onError?.(msg);
          setLibraryKeys((prev) =>
            new Set(prev).add(libraryKey("tv", selected.id)),
          );
          return;
        }

        if (!result.success) {
          const msg = result.error || "Failed to add series";
          setDuplicateError(msg);
          onError?.(msg);
          return;
        }

        setLibraryKeys((prev) =>
          new Set(prev).add(libraryKey("tv", selected.id)),
        );
        setSuccessMessage(`${d.name || selected.name} added!`);
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setSelected(null);
        onSuccess?.();
      }, 900);
    } catch (err) {
      console.error(err);
      const msg = "Failed to add. Please try again.";
      setDuplicateError(msg);
      onError?.(msg);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const busy = isLocalSubmitting || externalSubmitting;
  const isDuplicateSelected = selected ? isInLibrary(selected) : false;
  const submitDisabled = busy || !selected || isDuplicateSelected;

  const displayName = (item: SearchResult) => {
    const year = item.date?.split("-")[0];
    return year ? `${item.name} (${year})` : item.name;
  };

  const ratingLabel = (v: number) => formatRating(v);

  const placeholder =
    filter === "all"
      ? "Search movies & TV..."
      : filter === "movie"
        ? "Search movies..."
        : "Search TV series...";

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* All | TV | Movies */}
      <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
        {(
          [
            { id: "all" as const, label: "All", icon: Squares2X2Icon },
            { id: "tv" as const, label: "TV", icon: TvIcon },
            { id: "movie" as const, label: "Movies", icon: FilmIcon },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={clsx(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg p-1 text-sm font-medium transition",
              filter === tab.id
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30"
          >
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {successMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {duplicateError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {duplicateError}
          </p>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border-1 border-slate-200 bg-white py-1.5 px-10 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="mt-2 text-sm text-slate-500">Searching...</p>
        </div>
      )}

      {/* In-flow results */}
      {showResults && !isSearching && searchResults.length > 0 && (
        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {searchResults.map((item) => {
            const exists = isInLibrary(item);
            const rating = ratingLabel(item.voteAverage);
            return (
              <button
                key={`${item.mediaType}-${item.id}`}
                type="button"
                disabled={exists}
                onClick={() => selectItem(item)}
                className={clsx(
                  "flex w-full items-center gap-3 border-b border-slate-100 p-2.5 text-left last:border-0 dark:border-slate-700",
                  exists
                    ? "cursor-not-allowed bg-slate-50 opacity-60 dark:bg-slate-800/50"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700",

                  item.mediaType === "movie"
                    ? "hover:bg-violet-100 dark:hover:bg-violet-950/40"
                    : "hover:bg-sky-100 dark:hover:bg-sky-950/40",
                )}
              >
                {getPosterUrl(item.posterPath) ? (
                  <Image
                    src={getPosterUrl(item.posterPath)!}
                    alt={item.name}
                    width={40}
                    height={56}
                    className="h-12 w-8 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-700">
                    {item.mediaType === "movie" ? (
                      <FilmIcon className="h-4 w-4 text-slate-400" />
                    ) : (
                      <TvIcon className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {displayName(item)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span
                      className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        item.mediaType === "movie"
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                          : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
                      )}
                    >
                      {item.mediaType === "movie" ? "Movie" : "TV Series"}
                    </span>
                    {rating && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <StarSolidIcon className="h-3 w-3" />
                        {rating}
                      </span>
                    )}
                    {exists && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        Already in Library
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showResults &&
        !isSearching &&
        searchResults.length === 0 &&
        searchQuery.trim().length >= 2 && (
          <p className="text-center text-sm text-slate-500">
            No results found.
          </p>
        )}

      {/* Selected preview */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
              "overflow-hidden rounded-xl border p-4",
              isDuplicateSelected
                ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50",
            )}
          >
            <div className="flex gap-3">
              {getPosterUrl(selected.posterPath, "w185") ? (
                <Image
                  src={getPosterUrl(selected.posterPath, "w185")!}
                  alt={selected.name}
                  width={64}
                  height={96}
                  className="h-24 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                  {selected.mediaType === "movie" ? (
                    <FilmIcon className="h-6 w-6 text-slate-400" />
                  ) : (
                    <TvIcon className="h-6 w-6 text-slate-400" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {displayName(selected)}
                  </p>
                  <span
                    className={clsx(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      selected.mediaType === "movie"
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                        : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
                    )}
                  >
                    {selected.mediaType === "movie" ? "Movie" : "TV"}
                  </span>
                  {selected.voteAverage && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <StarSolidIcon className="h-3 w-3" />
                      {selected.voteAverage.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-3 text-xs text-slate-500 dark:text-slate-400">
                  {selected.overview || "No overview"}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mt-2 text-xs font-medium text-brand-600 hover:underline"
                >
                  Clear selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitDisabled}
          className={clsx(
            "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition",
            submitDisabled
              ? "cursor-not-allowed bg-slate-300 dark:bg-slate-700"
              : "bg-brand-600 hover:bg-brand-700",
          )}
        >
          {busy
            ? "Adding..."
            : selected?.mediaType === "movie"
              ? "Add movie"
              : selected
                ? "Add series"
                : "Add to library"}
        </button>
      </div>
    </form>
  );
};

export default AddSeriesForm;
