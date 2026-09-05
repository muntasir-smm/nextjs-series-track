// app/ui/series-card.tsx

"use client";

import { useState } from "react";
import { PlusIcon, ArrowPathIcon, StarIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import clsx from "clsx";

interface SeriesCardProps {
  id: string;
  name: string;
  totalSeasons: number;
  posterPath?: string | null;
  voteAverage?: number;
  firstAirDate?: string | null;
  overview?: string | null;
  genres?: string[];
  isAdding?: boolean;
  onAdd: () => void;
  variant?: "default" | "compact";
}

const getPosterUrl = (
  posterPath: string | null | undefined,
  size: string = "w342",
) => {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

const formatYear = (dateString: string | null | undefined) => {
  if (!dateString) return "TBA";
  return new Date(dateString).getFullYear();
};

export default function SeriesCard({
  name,
  totalSeasons,
  posterPath,
  voteAverage,
  firstAirDate,
  overview,
  genres,
  isAdding = false,
  onAdd,
  variant = "default",
}: SeriesCardProps) {
  const [showFullOverview, setShowFullOverview] = useState(false);
  const posterUrl = getPosterUrl(posterPath);
  const isCompact = variant === "compact";

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg dark:border-slate-700 dark:bg-slate-800">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
            <span className="text-4xl font-bold text-white">
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* Add button */}
        <button
          onClick={onAdd}
          disabled={isAdding}
          className={clsx(
            "absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md transition-all",
            "opacity-0 group-hover:opacity-100 hover:bg-brand-700 disabled:opacity-50",
          )}
          title="Add to My Series"
        >
          {isAdding ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </button>

        {/* Rating */}
        {voteAverage && voteAverage > 0 && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-amber-400 backdrop-blur-sm">
            <StarIcon className="h-3 w-3 fill-amber-400 text-amber-400" />
            {voteAverage.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <h3
          className={clsx(
            "font-semibold text-slate-900 dark:text-white line-clamp-2",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {name}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>{totalSeasons || "?"} seasons</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>{formatYear(firstAirDate)}</span>
        </div>

        {!isCompact && genres && genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {!isCompact && overview && (
          <div className="mt-2">
            <p
              className={clsx(
                "text-xs text-slate-600 dark:text-slate-400",
                showFullOverview ? "" : "line-clamp-3",
              )}
            >
              {overview}
            </p>
            {overview.length > 150 && (
              <button
                onClick={() => setShowFullOverview(!showFullOverview)}
                className="mt-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                {showFullOverview ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
