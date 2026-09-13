// app/dashboard/tvSeries/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  TvIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  ClockIcon,
  CalendarIcon,
  LanguageIcon,
  FireIcon,
  SignalIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  getUserMediaById,
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
  type Series,
} from "@/app/lib/series";
import EpisodeTracker from "@/app/ui/tvSeries/episode-tracker";
import { SeriesEditModal } from "./components/series-edit-modal";
import { formatRating } from "@/app/lib/format";
import type { WatchedEpisodesMap } from "@/app/lib/definitions";

function imgUrl(path: string | null | undefined, size = "w500") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

type TmdbExtras = {
  cast?: {
    id: number;
    name: string;
    character?: string;
    profilePath?: string | null;
  }[];
  trailers?: { key: string; name: string }[];
  nextEpisodeToAir?: {
    seasonNumber: number;
    episodeNumber: number;
    name?: string;
    airDate?: string;
  } | null;
  episodeRunTime?: number[];
  homepage?: string | null;
};

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  const seriesId = useMemo(() => {
    if (!params?.id) return undefined;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  const [series, setSeries] = useState<Series | null>(null);
  const [extras, setExtras] = useState<TmdbExtras>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const enrichFromTmdb = useCallback(async (s: Series) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let tmdbId = s.tmdbId;
      if (!tmdbId) {
        const searchRes = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(s.name)}&type=tv`,
          { signal: controller.signal },
        );
        const searchData = await searchRes.json();
        tmdbId =
          searchData.results?.[0]?.id ||
          searchData.series?.[0]?.id ||
          searchData.results?.[0]?.tmdbId;
      }
      if (!tmdbId || controller.signal.aborted) return;

      const detailsRes = await fetch(`/api/tmdb/tv/${tmdbId}`, {
        signal: controller.signal,
      });
      if (!detailsRes.ok) return;
      const details = await detailsRes.json();
      if (!details || controller.signal.aborted) return;

      setSeries((prev) =>
        prev
          ? {
              ...prev,
              tmdbId: details.id ?? prev.tmdbId,
              voteAverage: details.voteAverage ?? prev.voteAverage,
              voteCount: details.voteCount ?? prev.voteCount,
              firstAirDate: details.firstAirDate ?? prev.firstAirDate,
              lastAirDate: details.lastAirDate ?? prev.lastAirDate,
              genres: details.genres ?? prev.genres,
              status: details.status ?? prev.status,
              tagline: details.tagline ?? prev.tagline,
              originalName: details.originalName ?? prev.originalName,
              originalLanguage:
                details.originalLanguage ?? prev.originalLanguage,
              popularity: details.popularity ?? prev.popularity,
              inProduction: details.inProduction ?? prev.inProduction,
              networks: details.networks ?? prev.networks,
              totalEpisodes: details.totalEpisodes ?? prev.totalEpisodes,
              totalSeasons: details.totalSeasons ?? prev.totalSeasons,
              seasons: details.seasons ?? prev.seasons,
              posterPath: details.posterPath ?? prev.posterPath,
              backdropPath: details.backdropPath ?? prev.backdropPath,
              overview: details.overview ?? prev.overview,
            }
          : prev,
      );

      setExtras({
        cast: details.cast || [],
        trailers: details.trailers || [],
        nextEpisodeToAir: details.nextEpisodeToAir || null,
        episodeRunTime: details.episodeRunTime || [],
        homepage: details.homepage || null,
      });
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        console.error(e);
      }
    }
  }, []);

  const loadSeries = useCallback(async () => {
    if (!seriesId) {
      setIsLoading(false);
      return;
    }
    try {
      const found = await getUserMediaById(seriesId);
      if (found && found.mediaType !== "movie") {
        setSeries(found);
        await enrichFromTmdb(found);
      } else {
        setSeries(null);
      }
    } catch (e) {
      console.error(e);
      setSeries(null);
    } finally {
      setIsLoading(false);
    }
  }, [seriesId, enrichFromTmdb]);

  useEffect(() => {
    loadSeries();
    return () => abortRef.current?.abort();
  }, [loadSeries]);

  const handleEdit = useCallback(
    async (
      _id: string,
      name: string,
      totalSeasons: number,
      upcomingSeasons: string[],
    ) => {
      if (!series) return;
      const updated = { ...series, name, totalSeasons, upcomingSeasons };
      const result = await updateSeriesAction(updated);
      if (result.success) {
        setSeries(updated);
        setIsEditing(false);
      }
    },
    [series],
  );

  const handleDelete = useCallback(async () => {
    if (!seriesId || !confirm("Remove this series from your library?")) return;
    setIsDeleting(true);
    const result = await deleteSeriesAction(seriesId);
    if (result.success) router.push("/dashboard/tvSeries");
    else setIsDeleting(false);
  }, [seriesId, router]);

  const onProgressChange = useCallback(
    (watchedEpisodes: WatchedEpisodesMap, watchProgress: number) => {
      setSeries((prev) =>
        prev ? { ...prev, watchedEpisodes, watchProgress } : prev,
      );
    },
    [],
  );

  if (!seriesId || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <TvIcon className="h-12 w-12 text-slate-400" />
        <p className="text-slate-500 dark:text-slate-400">Series not found</p>
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

  const poster = imgUrl(series.posterPath);
  const backdrop = imgUrl(series.backdropPath, "w1280");
  const rating = formatRating(series.voteAverage);
  const year = series.firstAirDate
    ? String(series.firstAirDate).slice(0, 4)
    : null;
  const lastYear = series.lastAirDate
    ? String(series.lastAirDate).slice(0, 4)
    : null;
  const runtime =
    Array.isArray(extras.episodeRunTime) && extras.episodeRunTime[0]
      ? `~${extras.episodeRunTime[0]} min/ep`
      : null;
  const progress = Math.min(
    100,
    Math.max(0, Number(series.watchProgress) || 0),
  );

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
          <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-slate-950 dark:via-slate-950/70" />
      </div>

      <div className="relative mx-auto -mt-28 max-w-5xl px-4 sm:-mt-36 sm:px-6 lg:px-8">
        {/* Top actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <PencilIcon className="h-4 w-4" /> Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
              {isDeleting ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          {/* Poster */}
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="relative h-64 w-44 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10 sm:h-80 sm:w-56 dark:ring-white/10">
              {poster ? (
                <Image
                  src={poster}
                  alt={series.name}
                  fill
                  className="object-cover"
                  sizes="224px"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600 text-4xl font-bold text-white">
                  {series.name?.[0]}
                </div>
              )}
            </div>
            {rating && (
              <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-slate-900 dark:text-white">{rating}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                In your library
              </span>
              {series.status && (
                <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {series.status}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {series.name}
            </h1>
            {series.originalName && series.originalName !== series.name && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {series.originalName}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              {year && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                  {year}
                  {lastYear && lastYear !== year ? `–${lastYear}` : ""}
                </span>
              )}
              {(series.totalSeasons ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <TvIcon className="h-4 w-4 text-slate-400" />
                  {series.totalSeasons} season
                  {series.totalSeasons === 1 ? "" : "s"}
                </span>
              )}
              {(series.totalEpisodes ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <SignalIcon className="h-4 w-4 text-slate-400" />
                  {series.totalEpisodes} episodes
                </span>
              )}
              {runtime && (
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4 text-slate-400" />
                  {runtime}
                </span>
              )}
              {series.originalLanguage && (
                <span className="inline-flex items-center gap-1.5">
                  <LanguageIcon className="h-4 w-4 text-slate-400" />
                  {String(series.originalLanguage).toUpperCase()}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  Watch progress
                </span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {Array.isArray(series.genres) && series.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {series.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {series.tagline && (
              <p className="mt-4 border-l-2 border-brand-500 pl-3 text-sm italic text-slate-600 dark:text-slate-400">
                “{series.tagline}”
              </p>
            )}

            {series.overview && (
              <p className="mt-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {series.overview}
              </p>
            )}
          </div>
        </div>

        {/* Next episode */}
        {extras.nextEpisodeToAir && (
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-violet-50 p-4 sm:flex-row sm:items-center sm:gap-4 dark:border-brand-900/50 dark:from-brand-950/40 dark:to-violet-950/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
                Next episode
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white">
                S{extras.nextEpisodeToAir.seasonNumber}E
                {extras.nextEpisodeToAir.episodeNumber}
                {extras.nextEpisodeToAir.name
                  ? ` · ${extras.nextEpisodeToAir.name}`
                  : ""}
              </p>
            </div>
            {extras.nextEpisodeToAir.airDate && (
              <p className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                Airs {extras.nextEpisodeToAir.airDate}
              </p>
            )}
          </div>
        )}

        {/* Meta tiles */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.isArray(series.networks) && series.networks.length > 0 && (
            <MetaCard
              icon={<TvIcon className="h-4 w-4" />}
              label="Networks"
              value={series.networks.join(", ")}
            />
          )}
          {series.inProduction != null && (
            <MetaCard
              icon={<SignalIcon className="h-4 w-4" />}
              label="In production"
              value={series.inProduction ? "Yes" : "No"}
            />
          )}

          {extras.homepage && (
            <a
              href={extras.homepage}
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

        {/* Episode tracker — only progress UI */}
        <section className="mt-12">
          <SectionHeading>Season & Episode</SectionHeading>
          <div className="rounded-2xl">
            {series.tmdbId ? (
              <EpisodeTracker
                seriesId={series.id}
                tmdbId={series.tmdbId}
                seasons={series.seasons || []}
                totalEpisodes={series.totalEpisodes || 0}
                watchedEpisodes={series.watchedEpisodes || {}}
                onProgressChange={onProgressChange}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Link a TMDB id to enable episode-level tracking. Try refreshing
                this page after a successful enrich, or re-add from search.
              </p>
            )}
          </div>
        </section>

        {/* Cast */}
        {Array.isArray(extras.cast) && extras.cast.length > 0 && (
          <section className="mt-12">
            <SectionHeading>Cast</SectionHeading>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
              {extras.cast.map((c) => {
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
        {Array.isArray(extras.trailers) && extras.trailers.length > 0 && (
          <section className="mt-12">
            <SectionHeading>Trailers</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              {extras.trailers.map((t) => (
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

      <SeriesEditModal
        open={isEditing}
        series={series}
        onClose={() => setIsEditing(false)}
        onSave={handleEdit}
      />
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
