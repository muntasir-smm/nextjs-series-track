// app/dashboard/tvSeries/[id]/components/series-hero.tsx

"use client";

import Image from "next/image";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  TvIcon,
  FilmIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import type { Series } from "@/app/lib/series";

interface SeriesHeroProps {
  series: Series;
  isDark: boolean;
  isDeleting: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getGenreColor: (genre: string, isDark: boolean) => string | undefined;
}

function getBackdropUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/original${path}`;
}

function getPosterUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/w400${path}`;
}

export function SeriesHero({
  series,
  isDark,
  isDeleting,
  onBack,
  onEdit,
  onDelete,
  getGenreColor,
}: SeriesHeroProps) {
  const backdropUrl = getBackdropUrl(series.backdropPath);
  const posterUrl = getPosterUrl(series.posterPath);
  const firstAirYear = series.firstAirDate
    ? new Date(series.firstAirDate).getFullYear()
    : null;
  const hasUpcoming = (series.upcomingSeasons?.length || 0) > 0;
  const watchedCount = (series.watchedSeasons || []).filter(Boolean).length;

  return (
    <div className="relative h-[520px] overflow-hidden md:h-[600px]">
      {backdropUrl ? (
        <>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-50 via-slate-900/40 to-transparent dark:from-slate-950 dark:via-black/70" />
          <Image
            src={backdropUrl}
            alt={series.name}
            fill
            className="object-cover"
            priority
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-violet-700" />
      )}

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10">
        <div className="absolute left-6 right-6 top-6 z-30 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-black/50 dark:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-md dark:border-white/20 dark:bg-white/10 dark:text-white"
            >
              <PencilIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-full border border-red-400 bg-red-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/20"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isDeleting ? "Deleting..." : "Delete"}
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-row items-end gap-6">
          {posterUrl && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-30 hidden w-48 shrink-0 sm:block md:w-56"
            >
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <Image
                  src={posterUrl}
                  alt={series.name}
                  width={300}
                  height={450}
                  className="h-auto w-full"
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 pb-4"
          >
            <h1 className="text-3xl font-bold leading-tight text-slate-900 drop-shadow-lg dark:text-white md:text-5xl">
              {series.name}
            </h1>
            {series.tagline && (
              <p className="mt-2 text-base italic text-slate-700 dark:text-slate-300">
                {series.tagline}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                TV Series
              </span>
              {firstAirYear && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {firstAirYear}
                </span>
              )}
              {series.status && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs dark:bg-slate-700 dark:text-slate-300">
                  {series.status}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-5">
              <Stat
                icon={<TvIcon className="h-5 w-5 text-brand-600" />}
                label="Seasons"
                value={String(series.totalSeasons)}
              />
              {series.totalEpisodes != null && series.totalEpisodes > 0 && (
                <Stat
                  icon={<FilmIcon className="h-5 w-5 text-emerald-600" />}
                  label="Episodes"
                  value={String(series.totalEpisodes)}
                />
              )}
              <Stat
                icon={<ClockIcon className="h-5 w-5 text-orange-600" />}
                label="Upcoming"
                value={hasUpcoming ? "Yes" : "No"}
              />
              {series.voteAverage != null && series.voteAverage > 0 && (
                <Stat
                  icon={<StarSolidIcon className="h-5 w-5 text-amber-500" />}
                  label="Rating"
                  value={series.voteAverage.toFixed(1)}
                />
              )}
            </div>

            {series.genres && series.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {series.genres.map((genre) => (
                  <span
                    key={genre}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                      getGenreColor(genre, isDark) ||
                      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 max-w-md">
              <div className="mb-1 flex justify-between text-sm text-slate-700 dark:text-slate-300">
                <span>Watch progress</span>
                <span className="font-semibold">{series.watchProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all"
                  style={{ width: `${series.watchProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {watchedCount} of {series.totalSeasons} seasons marked
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-xl bg-white/80 p-2 dark:bg-slate-900/50">
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-lg font-bold text-slate-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}
