// app/components/landing/popular-section.tsx

import Link from "next/link";
import { ArrowRightIcon, FilmIcon, TvIcon } from "@heroicons/react/24/outline";
import { MediaCard } from "./media-card";
import type { PopularItem } from "./types";

interface PopularSectionProps {
  kind: "tv" | "movie";
  items: PopularItem[];
  loading?: boolean;
  error?: string | null;
}

export function PopularSection({
  kind,
  items,
  loading,
  error,
}: PopularSectionProps) {
  const isTv = kind === "tv";
  const title = isTv ? "Popular series right now" : "Popular movies";
  const subtitle = isTv
    ? "Tap a poster for full details — add to your library after you sign up"
    : "Films trending worldwide — open any title, track it when you join";
  const label = isTv ? "TV series" : "Movies";
  const Icon = isTv ? TvIcon : FilmIcon;
  const labelColor = isTv
    ? "text-sky-600 dark:text-sky-400"
    : "text-violet-600 dark:text-violet-400";
  const sectionBg = isTv
    ? "bg-white dark:bg-slate-900"
    : "bg-slate-50 dark:bg-slate-950";

  return (
    <div className={`py-16 ${sectionBg}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <div
              className={`mb-2 inline-flex items-center gap-1.5 text-sm font-medium ${labelColor}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
          <Link
            href="/signup"
            className="mt-4 hidden text-sm font-semibold text-brand-600 hover:underline sm:inline dark:text-brand-400"
          >
            Track free →
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
          </div>
        ) : error && items.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Try again
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.slice(0, 12).map((item) => (
              <MediaCard
                key={`${kind}-${item.id}`}
                item={{ ...item, mediaType: kind }}
                href={
                  kind === "movie"
                    ? `/explore/movie/${item.tmdbId || item.id}`
                    : `/explore/tv/${item.tmdbId || item.id}`
                }
              />
            ))}
          </div>
        ) : null}

        {error && items.length > 0 && (
          <p className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400">
            {error}
          </p>
        )}

        {!isTv && (
          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Start tracking free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
