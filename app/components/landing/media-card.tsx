// app/components/landing/media-card.tsx

import Link from "next/link";
import Image from "next/image";
import type { PopularItem } from "./types";

function getPosterUrl(posterPath: string | null, size = "w342") {
  if (!posterPath) return null;
  if (posterPath.startsWith("http")) return posterPath;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

function formatYear(dateString?: string | null) {
  if (!dateString) return null;
  const year = new Date(dateString).getFullYear();
  return Number.isNaN(year) ? null : year;
}

function ratingLabel(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(1);
}

interface MediaCardProps {
  item: PopularItem;
  href: string;
  badge?: string;
}

export function MediaCard({ item, href, badge }: MediaCardProps) {
  const posterUrl = getPosterUrl(item.posterPath);
  const year = formatYear(item.firstAirDate || item.releaseDate);
  const rating = ratingLabel(item.voteAverage);
  const seasons =
    item.totalSeasons && item.totalSeasons > 0 ? item.totalSeasons : null;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={item.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 16vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
            <span className="text-2xl font-bold text-white">
              {item.name.charAt(0)}
            </span>
          </div>
        )}

        {rating && (
          <div className="absolute right-2 top-2 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
            ★ {rating}
          </div>
        )}

        {badge && (
          <div className="absolute left-2 top-2 rounded-lg bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {badge}
          </div>
        )}

        {seasons != null && (
          <div className="absolute bottom-2 left-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {seasons} season{seasons === 1 ? "" : "s"}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
          {item.name}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {year ?? (item.mediaType === "movie" ? "Movie" : "TV")}
        </p>
      </div>
    </Link>
  );
}
