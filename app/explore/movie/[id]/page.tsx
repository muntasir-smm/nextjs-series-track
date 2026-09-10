"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  StarIcon as StarOutlineIcon,
  ClockIcon,
  CalendarIcon,
  LanguageIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { formatRating } from "@/app/lib/format";

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
    notation: n >= 1_000_000 ? "compact" : "standard",
  }).format(n);
}

export default function PublicMoviePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/tmdb/movie/${id}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Could not load this movie.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 dark:bg-slate-950">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300">
            {error || "Not found"}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back home
          </Link>
        </div>
      </div>
    );
  }

  const title = data.name || data.title || "Movie";
  const poster = imgUrl(data.posterPath);
  const backdrop = imgUrl(data.backdropPath, "w1280");
  const rating = formatRating(data.voteAverage);
  const year = data.releaseDate ? String(data.releaseDate).slice(0, 4) : null;
  const runtime =
    data.runtime != null && Number(data.runtime) > 0
      ? `${Number(data.runtime)} min`
      : null;
  const budget = formatMoney(Number(data.budget) || 0);
  const revenue = formatMoney(Number(data.revenue) || 0);

  return (
    <main className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-950">
      {/* Hero backdrop */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-96">
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
          <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-slate-950 dark:via-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(0,0,0,0.35)_100%)]" />
      </div>

      <div className="relative mx-auto -mt-32 max-w-5xl px-4 sm:-mt-40 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          {/* Poster */}
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="group relative h-64 w-44 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-brand-500/20 sm:h-80 sm:w-56 dark:ring-white/10">
              {poster ? (
                <Image
                  src={poster}
                  alt={title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="224px"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600 text-4xl font-bold text-white">
                  {title.charAt(0)}
                </div>
              )}
            </div>

            {rating && (
              <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-slate-900 dark:text-white">{rating}</span>
                {data.voteCount > 0 && (
                  <span className="font-normal text-slate-400">
                    ({Number(data.voteCount).toLocaleString()})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                Movie
              </span>
              {data.status && (
                <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {data.status}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
              {title}
            </h1>

            {data.originalName && data.originalName !== title && (
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {data.originalName}
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
              {data.originalLanguage && (
                <span className="inline-flex items-center gap-1.5">
                  <LanguageIcon className="h-4 w-4 text-slate-400" />
                  {String(data.originalLanguage).toUpperCase()}
                </span>
              )}
            </div>

            {Array.isArray(data.genres) && data.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.genres.map((g: string) => (
                  <span
                    key={g}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {data.tagline && (
              <p className="mt-4 border-l-2 border-brand-500 pl-3 text-sm italic text-slate-600 dark:text-slate-400">
                “{data.tagline}”
              </p>
            )}

            {data.overview && (
              <p className="mt-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {data.overview}
              </p>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/signup?next=/explore/movie/${id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/20"
              >
                <PlusIcon className="h-4 w-4" />
                Add to library
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Stat tiles */}
        <section className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {budget && (
            <MetaCard
              icon={<BanknotesIcon className="h-4 w-4" />}
              label="Budget"
              value={budget}
            />
          )}
          {revenue && (
            <MetaCard
              icon={<BanknotesIcon className="h-4 w-4" />}
              label="Revenue"
              value={revenue}
            />
          )}
          {data.popularity != null && (
            <MetaCard
              icon={<FireIcon className="h-4 w-4" />}
              label="Popularity"
              value={Number(data.popularity).toFixed(0)}
            />
          )}
          {Array.isArray(data.productionCompanies) &&
            data.productionCompanies.length > 0 && (
              <MetaCard
                icon={<BuildingOfficeIcon className="h-4 w-4" />}
                label="Studios"
                value={data.productionCompanies.join(", ")}
              />
            )}
          {data.imdbId && (
            <a
              href={`https://www.imdb.com/title/${data.imdbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <StarOutlineIcon className="h-4 w-4" />
                <p className="text-[10px] font-semibold uppercase tracking-wider">
                  IMDb
                </p>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-brand-600 group-hover:underline dark:text-brand-400">
                {data.imdbId}
              </p>
            </a>
          )}
          {data.homepage && (
            <a
              href={data.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="group col-span-2 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <GlobeAltIcon className="h-4 w-4" />
                <p className="text-[10px] font-semibold uppercase tracking-wider">
                  Homepage
                </p>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-brand-600 group-hover:underline dark:text-brand-400">
                Official site
              </p>
            </a>
          )}
        </section>

        {/* Crew */}
        {Array.isArray(data.crew) && data.crew.length > 0 && (
          <section className="mt-10">
            <SectionHeading>Crew</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {data.crew.map((c: any, i: number) => (
                <span
                  key={`${c.name}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {c.name}
                  </span>
                  <span className="text-slate-400">{c.job}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {Array.isArray(data.cast) && data.cast.length > 0 && (
          <section className="mt-12">
            <SectionHeading>Cast</SectionHeading>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
              {data.cast.map((c: any) => {
                const img = imgUrl(c.profilePath, "w185");
                return (
                  <div key={c.id} className="w-24 shrink-0 text-center">
                    <div className="relative mx-auto mb-2 h-24 w-24 overflow-hidden rounded-full bg-slate-200 ring-2 ring-transparent transition hover:ring-brand-500/60 dark:bg-slate-800">
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
        {Array.isArray(data.trailers) && data.trailers.length > 0 && (
          <section className="mt-12">
            <SectionHeading>Trailers</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-3">
              {data.trailers.map((t: any) => (
                <a
                  key={t.key}
                  href={`https://www.youtube.com/watch?v=${t.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800"
                >
                  <Image
                    src={`https://img.youtube.com/vi/${t.key}/hqdefault.jpg`}
                    alt={t.name}
                    fill
                    className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircleIcon className="h-14 w-14 text-white drop-shadow-lg transition duration-300 group-hover:scale-110" />
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 truncate px-3 py-2.5 text-xs font-medium text-white">
                    {t.name}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700">
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

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative h-56 w-full animate-pulse bg-slate-200 sm:h-72 md:h-96 dark:bg-slate-800" />
      <div className="mx-auto -mt-32 max-w-5xl px-4 sm:-mt-40 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div className="mx-auto h-64 w-44 animate-pulse rounded-2xl bg-slate-200 sm:mx-0 sm:h-80 sm:w-56 dark:bg-slate-800" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-24 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
