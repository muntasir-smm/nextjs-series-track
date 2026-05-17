// app/ui/series-card.tsx

"use client";

import { useState } from "react";
import { PlusIcon, ArrowPathIcon, StarIcon } from "@heroicons/react/24/outline";

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
  id,
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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-4xl font-bold text-white">
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* Add Button - Top Left */}
        <button
          onClick={onAdd}
          disabled={isAdding}
          className="absolute top-2 left-2 rounded-md bg-blue-600/90 px-2 py-1 text-xs font-medium text-white opacity-0 transition-all duration-300 hover:bg-blue-700 group-hover:opacity-100 disabled:opacity-50"
          title="Add to My Series"
        >
          {isAdding ? (
            <ArrowPathIcon className="h-3 w-3 animate-spin" />
          ) : (
            <PlusIcon className="h-3 w-3" />
          )}
        </button>

        {/* Rating Badge - Top Right */}
        {voteAverage && voteAverage > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
            <StarIcon className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            {voteAverage.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-2">
        {/* Title */}
        <div className={isCompact ? "min-h-[2rem]" : "min-h-[2.5rem]"}>
          <h3
            className={`font-semibold text-gray-900 dark:text-white line-clamp-2 ${isCompact ? "text-xs" : "text-sm"}`}
          >
            {name}
          </h3>
        </div>

        {/* Season & Year */}
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{totalSeasons || "?"} seasons</span>
          <span>•</span>
          <span>{formatYear(firstAirDate)}</span>
        </div>

        {/* Genres - Only show in default mode */}
        {!isCompact && genres && genres.length > 0 && (
          <div className="mt-1">
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 2).map((genre: string) => (
                <span
                  key={genre}
                  className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isCompact && !genres?.length && (
          <div className="mt-1">
            <span className="text-[10px] text-gray-400">No genres</span>
          </div>
        )}

        {/* Overview - Only show in default mode */}
        {!isCompact && overview && (
          <div className="relative mt-2">
            <p
              className={`text-xs text-gray-600 dark:text-gray-400 transition-all duration-300 ${
                showFullOverview ? "line-clamp-none" : "line-clamp-3"
              }`}
            >
              {overview}
            </p>
            {overview.length > 150 && (
              <button
                onClick={() => setShowFullOverview(!showFullOverview)}
                className="mt-1 text-[10px] text-blue-500 hover:text-blue-600"
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
