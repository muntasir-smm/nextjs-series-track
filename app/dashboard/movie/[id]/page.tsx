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
  GlobeAltIcon,
  PlayCircleIcon,
  ClockIcon,
  CalendarIcon,
  LanguageIcon,
  FireIcon,
  FilmIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  getUserMediaById,
  deleteSeries,
  toggleMovieWatched,
} from "@/app/lib/series";
import type { Series } from "@/app/lib/series";
import { formatRating } from "@/app/lib/format";
import clsx from "clsx";

function imgUrl(path: string | null | undefined, size = "w500") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function formatMoney(n: number) {
  if (!n || n <= 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

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
                  voteCount: data.voteCount ?? prev.voteCount,
                  releaseDate: data.releaseDate || prev.releaseDate,
                  posterPath: data.posterPath || prev.posterPath,
                  backdropPath: data.backdropPath || prev.backdropPath,
                  originalName: data.originalName || prev.originalName,
                  originalLanguage:
                    data.originalLanguage || prev.originalLanguage,
                  popularity: data.popularity ?? prev.popularity,
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
    const snapshot = movie;
    setMovie({ ...movie, watched: next, watchProgress: next ? 100 : 0 });
    try {
      const result = await toggleMovieWatched(movie.id, next);
      if (!result.success) setMovie(snapshot);
    } catch {
      setMovie(snapshot);
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

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <FilmIcon className="h-12 w-12 text-slate-400" />
        <p className="text-slate-500 dark:text-slate-400">
          Movie not found in your library.
        </p>
        <Link
          href="/dashboard/tvSeries"
          className="inline-flex items-center gap-2 text-brand-600 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to library
        </Link>
      </div>
    );
  }

  const poster = imgUrl(movie.posterPath);
  const backdrop = imgUrl(movie.backdropPath, "w1280");
  const rating = formatRating(movie.voteAverage);
  const year = movie.releaseDate ? String(movie.releaseDate).slice(0, 4) : null;
  const runtime =
    movie.runtime != null && Number(movie.runtime) > 0
      ? `${Number(movie.runtime)} min`
      : null;
  const budget = formatMoney(Number(tmdbExtra?.budget) || 0);
  const revenue = formatMoney(Number(tmdbExtra?.revenue) || 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-950">
      {/* Backdrop */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-600 via-violet-700 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-slate-950 dark:via-slate-950/70" />
      </div>

      <div className="relative mx-auto -mt-28 max-w-5xl px-4 sm:-mt-36 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </button>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          {/* Poster */}
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="relative h-64 w-44 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10 sm:h-80 sm:w-56 dark:ring-white/10">
              {poster ? (
                <Image
                  src={poster}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  sizes="224px"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600 text-4xl font-bold text-white">
                  {movie.name.charAt(0)}
                </div>
              )}
            </div>
            {rating && (
              <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-slate-900 dark:text-white">{rating}</span>
                {movie.voteCount != null && Number(movie.voteCount) > 0 && (
                  <span className="font-normal text-slate-400">
                    ({Number(movie.voteCount).toLocaleString()})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                In your library
              </span>
              <span
                className={clsx(
                  "rounded-full px-2.5 py-1",
                  movie.watched
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                )}
              >
                {movie.watched ? "Watched" : "Not watched"}
              </span>
              {movie.status && (
                <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {movie.status}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {movie.name}
            </h1>
            {movie.originalName && movie.originalName !== movie.name && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {movie.originalName}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              {year && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                  {year}
                </span>
              )}
              {runtime && (
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4 text-slate-400" />
                  {runtime}
                </span>
              )}
              {movie.originalLanguage && (
                <span className="inline-flex items-center gap-1.5">
                  <LanguageIcon className="h-4 w-4 text-slate-400" />
                  {String(movie.originalLanguage).toUpperCase()}
                </span>
              )}
            </div>

            {Array.isArray(movie.genres) && movie.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {movie.tagline && (
              <p className="mt-4 border-l-2 border-brand-500 pl-3 text-sm italic text-slate-600 dark:text-slate-400">
                “{movie.tagline}”
              </p>
            )}

            {movie.overview && (
              <p className="mt-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {movie.overview}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={handleToggleWatched}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50",
                  movie.watched
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-brand-600 hover:bg-brand-700",
                )}
              >
                <CheckCircleIcon className="h-5 w-5" />
                {movie.watched ? "Watched — tap to undo" : "Mark as watched"}
              </button>
            </div>
          </div>
        </div>

        {/* Meta tiles */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {budget && (
            <MetaCard
              icon={<CurrencyDollarIcon className="h-4 w-4" />}
              label="Budget"
              value={budget}
            />
          )}
          {revenue && (
            <MetaCard
              icon={<CurrencyDollarIcon className="h-4 w-4" />}
              label="Revenue"
              value={revenue}
            />
          )}
          {movie.popularity != null && (
            <MetaCard
              icon={<FireIcon className="h-4 w-4" />}
              label="Popularity"
              value={Number(movie.popularity).toFixed(0)}
            />
          )}
          {tmdbExtra?.imdbId && (
            <a
              href={`https://www.imdb.com/title/${tmdbExtra.imdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                IMDb
              </p>
              <p className="mt-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                {tmdbExtra.imdbId}
              </p>
            </a>
          )}
          {Array.isArray(tmdbExtra?.productionCompanies) &&
            tmdbExtra.productionCompanies.length > 0 && (
              <MetaCard
                icon={<FilmIcon className="h-4 w-4" />}
                label="Studios"
                value={
                  Array.isArray(tmdbExtra.productionCompanies[0])
                    ? tmdbExtra.productionCompanies.join(", ")
                    : typeof tmdbExtra.productionCompanies[0] === "string"
                      ? tmdbExtra.productionCompanies.join(", ")
                      : tmdbExtra.productionCompanies
                          .map((c: any) => c.name || c)
                          .join(", ")
                }
              />
            )}
          {tmdbExtra?.homepage && (
            <a
              href={tmdbExtra.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <GlobeAltIcon className="h-4 w-4" />
                <p className="text-[10px] font-semibold uppercase tracking-wider">
                  Homepage
                </p>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                Official site
              </p>
            </a>
          )}
        </section>

        {/* Crew */}
        {Array.isArray(tmdbExtra?.crew) && tmdbExtra.crew.length > 0 && (
          <section className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Crew
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {tmdbExtra.crew
                .map((c: any) => `${c.name} (${c.job})`)
                .join(" · ")}
            </p>
          </section>
        )}

        {/* Cast */}
        {Array.isArray(tmdbExtra?.cast) && tmdbExtra.cast.length > 0 && (
          <section className="mt-12">
            <SectionHeading>Cast</SectionHeading>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
              {tmdbExtra.cast.map((c: any) => {
                const img = imgUrl(c.profilePath, "w185");
                return (
                  <div key={c.id} className="w-24 shrink-0 text-center">
                    <div className="relative mx-auto mb-2 h-24 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      {img ? (
                        <Image
                          src={img}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg font-semibold text-slate-400">
                          {c.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs font-semibold text-slate-900 dark:text-white">
                      {c.name}
                    </p>
                    <p className="line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400">
                      {c.character}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Trailers */}
        {Array.isArray(tmdbExtra?.trailers) &&
          tmdbExtra.trailers.length > 0 && (
            <section className="mt-12">
              <SectionHeading>Trailers</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                {tmdbExtra.trailers.map((t: any) => (
                  <a
                    key={t.key}
                    href={`https://www.youtube.com/watch?v=${t.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 dark:border-slate-800"
                  >
                    <Image
                      src={`https://img.youtube.com/vi/${t.key}/hqdefault.jpg`}
                      alt={t.name}
                      fill
                      className="object-cover opacity-80 transition group-hover:opacity-100"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircleIcon className="h-14 w-14 text-white drop-shadow-lg" />
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-3 py-2 text-xs text-white">
                      {t.name}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}

function MetaCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
      <span className="h-5 w-1 rounded-full bg-brand-500" />
      {children}
    </h2>
  );
}
