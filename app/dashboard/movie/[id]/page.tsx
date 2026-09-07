// app/dashboard/movie/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import {
  getUserMediaById,
  deleteSeries,
  toggleMovieWatched,
} from "@/app/lib/series";
import type { Series } from "@/app/lib/series";
import clsx from "clsx";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = useMemo(() => {
    if (!params?.id) return undefined;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  const [movie, setMovie] = useState<Series | null>(null);
  const [tmdbExtra, setTmdbExtra] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!movieId) {
      setIsLoading(false);
      return;
    }
    try {
      const found = await getUserMediaById(movieId);
      if (!found || found.mediaType === "tv") {
        setMovie(null);
        return;
      }
      setMovie(found);

      if (found.tmdbId) {
        const res = await fetch(`/api/tmdb/movie/${found.tmdbId}`);
        if (res.ok) {
          const data = await res.json();
          setTmdbExtra(data);
          setMovie((prev) =>
            prev
              ? {
                  ...prev,
                  overview: data.overview || prev.overview,
                  runtime: data.runtime ?? prev.runtime,
                  genres: data.genres || prev.genres,
                  status: data.status || prev.status,
                  tagline: data.tagline || prev.tagline,
                  voteAverage: data.voteAverage ?? prev.voteAverage,
                  releaseDate: data.releaseDate || prev.releaseDate,
                }
              : prev,
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleWatched = async () => {
    if (!movie || busy) return;
    setBusy(true);
    const next = !movie.watched;
    setMovie({ ...movie, watched: next, watchProgress: next ? 100 : 0 });
    try {
      const result = await toggleMovieWatched(movie.id, next);
      if (!result.success) {
        setMovie({ ...movie, watched: !next, watchProgress: next ? 0 : 100 });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!movieId || !confirm("Remove this movie from your library?")) return;
    setBusy(true);
    const result = await deleteSeries(movieId);
    if (result.success) router.push("/dashboard/tvSeries");
    else setBusy(false);
  };

  const posterUrl = movie?.posterPath
    ? movie.posterPath.startsWith("http")
      ? movie.posterPath
      : `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  const backdropUrl = movie?.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
    : null;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Movie not found in your library.</p>
        <Link
          href="/dashboard/tvSeries"
          className="mt-4 inline-block text-brand-600 hover:underline"
        >
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Backdrop */}
      <div className="relative -mx-4 mb-6 h-48 overflow-hidden sm:-mx-6 sm:h-64 lg:-mx-8 lg:h-72">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-brand-600 to-violet-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-slate-950 dark:via-slate-950/70" />
      </div>

      <Link
        href="/dashboard/tvSeries"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Library
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative mx-auto h-64 w-44 shrink-0 overflow-hidden rounded-2xl shadow-soft-lg sm:mx-0">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-200 dark:bg-slate-800">
              <span className="text-3xl font-bold text-slate-400">
                {movie.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {movie.name}
          </h1>
          {movie.tagline && (
            <p className="mt-1 text-sm italic text-slate-500">
              {movie.tagline}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            {(() => {
              const rating = Number(movie.voteAverage);
              if (!Number.isFinite(rating) || rating <= 0) return null;
              return (
                <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                  <StarSolidIcon className="h-4 w-4" />
                  {rating.toFixed(1)}
                </span>
              );
            })()}
            {movie.releaseDate && (
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            )}
            {movie.runtime != null && movie.runtime > 0 && (
              <span>{movie.runtime} min</span>
            )}
            {movie.status && <span>{movie.status}</span>}
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {movie.overview || "No overview available."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={handleToggleWatched}
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                movie.watched
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-brand-600 text-white hover:bg-brand-700",
              )}
            >
              <CheckCircleIcon className="h-5 w-5" />
              {movie.watched ? "Watched" : "Mark as watched"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
            >
              <TrashIcon className="h-5 w-5" />
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Cast from TMDB */}
      {tmdbExtra?.cast?.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Cast
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {tmdbExtra.cast.map((c: any) => (
              <div key={c.id} className="w-24 shrink-0 text-center">
                <div className="relative mx-auto mb-2 h-24 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  {c.profilePath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${c.profilePath}`}
                      alt={c.name}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <p className="line-clamp-2 text-xs font-medium text-slate-900 dark:text-white">
                  {c.name}
                </p>
                <p className="line-clamp-1 text-[10px] text-slate-500">
                  {c.character}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
