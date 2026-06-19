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
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg dark:bg-gray-700 mb-4" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-lg bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (featured.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 p-1.5">
          <StarIcon className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Featured Series
        </h2>
        <span className="text-xs text-gray-500">Curated by our team</span>
      </div>

      {/* Featured Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((series) => (
          <Link
            key={series.id}
            href={`/dashboard/tvSeries/${series.series_id}`}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex gap-4 p-4">
              {/* Poster */}
              {series.poster_path && (
                <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${series.poster_path}`}
                    alt={series.series_name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {series.series_name}
                  </h3>
                  <StarIcon className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                </div>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {series.reason || "Staff pick"}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <StarOutlineIcon className="h-3 w-3" />
                    Featured
                  </span>
                  <span className="text-xs text-gray-500">Click to view →</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
