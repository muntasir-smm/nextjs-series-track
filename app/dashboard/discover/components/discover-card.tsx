// app/dashboard/discover/components/discover-card.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { mediaDetailHref } from "@/app/lib/media-href";
import { posterUrl, type DiscoverItem } from "../utils";
import { MediaBadge } from "./media-badge";
import { AddButton } from "./add-button";

interface DiscoverCardProps {
  item: DiscoverItem;
  isAdding: boolean;
  librarySeriesId?: string | null;
  onAdd: (item: DiscoverItem) => void;
}

export function DiscoverCard({
  item,
  isAdding,
  librarySeriesId,
  onAdd,
}: DiscoverCardProps) {
  const poster = posterUrl(item.posterPath);
  const year = item.releaseDate || item.firstAirDate;
  const yearLabel = year ? String(year).slice(0, 4) : null;
  const rating = Number(item.voteAverage);
  const inLibrary = !!librarySeriesId;
  const detailHref = mediaDetailHref(
    item.mediaType,
    item.tmdbId,
    librarySeriesId,
  );

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <Link
        href={detailHref}
        className="relative block aspect-[2/3] bg-slate-100 dark:bg-slate-800"
      >
        {poster ? (
          <Image
            src={poster}
            alt={item.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-400">
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-between gap-2">
          <MediaBadge mediaType={item.mediaType} />
          {Number.isFinite(rating) && rating > 0 && (
            <span className="inline-flex h-6 items-center rounded-lg bg-black/70 px-1.5 text-xs font-semibold text-amber-400 backdrop-blur">
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>
      </Link>
      <div className="p-2.5">
        <Link href={detailHref}>
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
            {item.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {yearLabel || (item.mediaType === "movie" ? "Movie" : "TV")}
        </p>
        <AddButton
          isAdding={isAdding}
          isInLibrary={inLibrary}
          onAdd={() => onAdd(item)}
        />
      </div>
    </div>
  );
}
