"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  FireIcon,
  StarIcon,
  PlusIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { SuggestedSeries } from "@/app/lib/definitions";
import clsx from "clsx";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const getPosterUrl = (
  posterPath: string | null | undefined,
  size: "w92" | "w185" = "w92",
): string | null => {
  if (!posterPath) return null;
  if (posterPath.startsWith("http")) return posterPath;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

const formatRating = (value: unknown): string | null => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n.toFixed(1) : null;
};

const formatSeasons = (value: unknown): string | null => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n} season${n === 1 ? "" : "s"}`;
};

const getLibraryKey = (item: SuggestedSeries): string => {
  const mediaType = item.mediaType === "movie" ? "movie" : "tv";
  const tmdbId = item.tmdbId ?? Number(item.id);
  return `${mediaType}:${tmdbId}`;
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

interface MediaBadgeProps {
  mediaType: "tv" | "movie";
}

function MediaBadge({ mediaType }: MediaBadgeProps) {
  return (
    <span
      className={clsx(
        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        mediaType === "movie"
          ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
          : "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
      )}
    >
      {mediaType === "movie" ? "Movie" : "TV Series"}
    </span>
  );
}

interface PosterThumbProps {
  src: string | null;
  alt: string;
}

function PosterThumb({ src, alt }: PosterThumbProps) {
  if (!src) {
    return (
      <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white">
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={60}
      className="h-14 w-10 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-slate-900/5"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

interface TrendingCardProps {
  item: SuggestedSeries;
  isAdding: boolean;
  isInLibrary: boolean;
  justAdded: boolean;
  onAdd: (item: SuggestedSeries) => void;
}

function TrendingCard({
  item,
  isAdding,
  isInLibrary,
  justAdded,
  onAdd,
}: TrendingCardProps) {
  const mediaType = item.mediaType === "movie" ? "movie" : "tv";
  const tmdbId = item.tmdbId ?? Number(item.id);
  const detailHref = `/explore/${mediaType}/${tmdbId}`;

  const poster = getPosterUrl(item.posterPath);
  const rating = formatRating(item.voteAverage);
  const seasons = formatSeasons(item.totalSeasons);

  return (
    <div
      className={clsx(
        "group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3",
        "shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft",
        "dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-800",
      )}
    >
      <Link
        href={detailHref}
        className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={`View ${item.name}`}
      >
        <PosterThumb src={poster} alt={item.name} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={detailHref}
          className="focus:outline-none focus-visible:underline"
        >
          <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
            {item.name}
          </h3>
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <MediaBadge mediaType={mediaType} />
          {seasons && (
            <>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{seasons}</span>
            </>
          )}
          {rating && (
            <>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="inline-flex items-center gap-0.5">
                <StarIcon className="h-3 w-3 text-amber-400" />
                {rating}
              </span>
            </>
          )}
        </div>
      </div>

      <AddButton
        isAdding={isAdding}
        isInLibrary={isInLibrary}
        justAdded={justAdded}
        onAdd={() => onAdd(item)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Add button (isolated for clarity + a11y)                            */
/* ------------------------------------------------------------------ */

interface AddButtonProps {
  isAdding: boolean;
  isInLibrary: boolean;
  justAdded: boolean;
  onAdd: () => void;
}

function AddButton({
  isAdding,
  isInLibrary,
  justAdded,
  onAdd,
}: AddButtonProps) {
  if (isInLibrary || justAdded) {
    return (
      <span
        className={clsx(
          "flex h-8 shrink-0 items-center gap-1 rounded-xl px-2.5 text-xs font-medium",
          "bg-emerald-50 text-emerald-700",
          "dark:bg-emerald-950/40 dark:text-emerald-400",
        )}
      >
        <CheckIcon className="h-3.5 w-3.5" />
        {justAdded ? "Added" : "In library"}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={isAdding}
      aria-label="Add to library"
      className={clsx(
        "flex h-8 shrink-0 items-center gap-1 rounded-xl px-2.5 text-xs font-medium",
        "bg-brand-600 text-white transition",
        "hover:bg-brand-700 active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
      )}
    >
      {isAdding ? (
        <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <PlusIcon className="h-3.5 w-3.5" />
      )}
      Add
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton + Empty                                                    */
/* ------------------------------------------------------------------ */

function TrendingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="h-14 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-2.5 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-8 w-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Section                                                        */
/* ------------------------------------------------------------------ */

export interface TrendingSectionProps {
  series: SuggestedSeries[];
  onAdd: (series: SuggestedSeries) => void;
  addingId: string | null;
  /** Optional: hide Add for these items */
  existingKeys?: Set<string>;
  /** Optional overrides */
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  /** Number of cards to show (default 8) */
  limit?: number;
  isLoading?: boolean;
}

export function TrendingSection({
  series,
  onAdd,
  addingId,
  existingKeys,
  title = "Trending Now",
  subtitle = "Popular titles you might like",
  viewAllHref = "/dashboard/discover",
  limit = 12,
  isLoading = false,
}: TrendingSectionProps) {
  // Track items added in this session for instant visual feedback
  const [justAddedKeys, setJustAddedKeys] = useState<Set<string>>(new Set());

  const handleAdd = useCallback(
    (item: SuggestedSeries) => {
      const key = getLibraryKey(item);
      setJustAddedKeys((prev) => new Set(prev).add(key));
      onAdd(item);
    },
    [onAdd],
  );

  // Clear "just added" if the parent removes the item from library
  // (e.g. add failed and rolled back)
  useEffect(() => {
    if (justAddedKeys.size === 0) return;
    setJustAddedKeys((prev) => {
      const next = new Set<string>();
      for (const key of prev) {
        if (existingKeys?.has(key)) next.add(key);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [existingKeys, justAddedKeys.size]);

  const visible = series.slice(0, limit);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/40">
            <FireIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm font-medium text-brand-600 transition hover:text-brand-700 focus:outline-none focus-visible:underline dark:text-brand-400 dark:hover:text-brand-300"
        >
          View all →
        </Link>
      </header>

      {isLoading ? (
        <TrendingSkeleton count={limit} />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nothing new to show right now. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => {
            const key = getLibraryKey(item);
            const isInLibrary = existingKeys?.has(key) ?? false;
            const justAdded = justAddedKeys.has(key);
            const tmdbId = item.tmdbId ?? item.id;
            const isAdding =
              addingId === item.id || addingId === String(tmdbId);

            return (
              <TrendingCard
                key={key}
                item={item}
                isAdding={isAdding}
                isInLibrary={isInLibrary}
                justAdded={justAdded}
                onAdd={handleAdd}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
