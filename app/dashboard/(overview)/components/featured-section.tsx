// app/dashboard/(overview)/components/featured-section.tsx

"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

interface FeaturedItem {
  id: string;
  seriesId: string;
  name: string;
  posterPath: string | null;
  reason: string;
  mediaType?: "tv" | "movie";
  tmdbId?: number | null;
}

export function FeaturedSection() {
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      // Public endpoint — works for all signed-in users
      const response = await fetch("/api/public/featured");
      const data = await response.json();
      setFeatured(Array.isArray(data.series) ? data.series : []);
    } catch (error) {
      console.error("Error loading featured:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (featured.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
          <StarIcon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Featured
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Curated movies &amp; series
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((item) => {
          const mediaType = item.mediaType === "movie" ? "movie" : "tv";
          const tmdbId = item.tmdbId ?? item.seriesId;
          const href = `/explore/${mediaType}/${tmdbId}`;

          return (
            <Link
              key={item.id}
              href={href}
              className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900"
            >
              {item.posterPath && (
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={
                      item.posterPath.startsWith("http")
                        ? item.posterPath
                        : `https://image.tmdb.org/t/p/w185${item.posterPath}`
                    }
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <StarIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                </div>

                <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {item.reason || "Staff pick"}
                </p>

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <span
                    className={clsx(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                      mediaType === "movie"
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                        : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
                    )}
                  >
                    {mediaType === "movie" ? "Movie" : "TV"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                    <StarOutlineIcon className="h-3 w-3" />
                    Featured
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
