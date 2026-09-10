// app/components/landing/featured-section.tsx

import { StarIcon } from "@heroicons/react/24/outline";
import { MediaCard } from "./media-card";
import type { FeaturedSeries } from "./types";

interface FeaturedSectionProps {
  items: FeaturedSeries[];
  loading?: boolean;
}

export function FeaturedSection({ items, loading }: FeaturedSectionProps) {
  if (loading || items.length === 0) return null;

  return (
    <div className="bg-slate-50 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
            <StarIcon className="h-4 w-4" />
            Editor&apos;s picks
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Featured series
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
            Hand-picked shows worth starting
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((series) => {
            const href = series.tmdbId
              ? `/explore/tv/${series.tmdbId}`
              : "/signup";
            return (
              <MediaCard
                key={series.id}
                href={href}
                badge="Featured"
                item={{
                  id: series.id,
                  name: series.name,
                  posterPath: series.posterPath,
                  voteAverage: 0,
                  overview: series.reason,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
