// app/dashboard/(overview)/components/featured-section.tsx

"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

interface FeaturedSeries {
  id: number;
  series_id: string;
  series_name: string;
  poster_path: string;
  reason: string;
  is_active: boolean;
}

export function FeaturedSection() {
  const [featured, setFeatured] = useState<FeaturedSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const response = await fetch("/api/admin/featured");
      const data = await response.json();
      setFeatured(data);
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
            Featured Series
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Curated by our team
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((series) => (
          <Link
            key={series.id}
            href={`/dashboard/tvSeries/${series.series_id}`}
            className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900"
          >
            {series.poster_path && (
              <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={`https://image.tmdb.org/t/p/w185${series.poster_path}`}
                  alt={series.series_name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {series.series_name}
                </h3>
                <StarIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              </div>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {series.reason || "Staff pick"}
              </p>

              <div className="mt-auto pt-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                  <StarOutlineIcon className="h-3 w-3" />
                  Featured
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
