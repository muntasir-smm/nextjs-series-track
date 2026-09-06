// app/dashboard/tvSeries/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TvIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  getUserMediaById,
  updateWatchProgress,
  updateSeries as updateSeriesAction,
  deleteSeries as deleteSeriesAction,
  type Series,
} from "@/app/lib/series";
import EpisodeTracker from "@/app/ui/tvSeries/episode-tracker";
import { SeriesHero } from "./components/series-hero";
import { SeriesSynopsis } from "./components/series-synopsis";
import { SeriesSeasonsGrid } from "./components/series-seasons-grid";
import { SeriesSidebar } from "./components/series-sidebar";
import { SeriesEditModal } from "./components/series-edit-modal";

const getGenreColor = (genre: string, isDark: boolean) => {
  // keep your existing maps or simplify to a neutral default
  return isDark
    ? "bg-slate-800 text-slate-300 border-slate-700"
    : "bg-slate-100 text-slate-800 border-slate-200";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingSeason, setUpdatingSeason] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

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
        tmdbId = searchData.results?.[0]?.id || searchData.series?.[0]?.id;
      }
      if (!tmdbId || controller.signal.aborted) return;

      const detailsRes = await fetch(`/api/tmdb/tv/${tmdbId}`, {
        signal: controller.signal,
      });
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
              seasons: details.seasons ?? prev.seasons,
            }
          : prev,
      );
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [seriesId, enrichFromTmdb]);

  useEffect(() => {
    loadSeries();
    return () => abortRef.current?.abort();
  }, [loadSeries]);

  const toggleSeason = useCallback(
    async (seasonIndex: number) => {
      if (updatingSeason !== null || !series) return;
      const next = [...(series.watchedSeasons || [])];
      next[seasonIndex] = !next[seasonIndex];
      const progress = Math.round(
        (next.filter(Boolean).length / (series.totalSeasons || 1)) * 100,
      );
      const snapshot = series;
      setUpdatingSeason(seasonIndex);
      setSeries({ ...series, watchedSeasons: next, watchProgress: progress });
      try {
        await updateWatchProgress(series.id, next);
      } catch {
        setSeries(snapshot);
      } finally {
        setUpdatingSeason(null);
      }
    },
    [series, updatingSeason],
  );

  const handleEdit = useCallback(
    async (
      id: string,
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
    if (!seriesId || !confirm("Delete this series?")) return;
    setIsDeleting(true);
    const result = await deleteSeriesAction(seriesId);
    if (result.success) router.push("/dashboard/tvSeries");
    else setIsDeleting(false);
  }, [seriesId, router]);

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
        <p className="text-slate-500">Series not found</p>
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SeriesHero
        series={series}
        isDark={isDark}
        isDeleting={isDeleting}
        onBack={() => router.back()}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
        getGenreColor={getGenreColor}
      />

      <div className="relative z-20 -mt-10 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SeriesSynopsis overview={series.overview} />

            {/* Episode-level tracking */}
            {series.tmdbId && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
                <EpisodeTracker
                  seriesId={series.id}
                  tmdbId={series.tmdbId}
                  seasons={series.seasons || []}
                  totalEpisodes={series.totalEpisodes || 0}
                  watchedEpisodes={series.watchedEpisodes || {}}
                  onProgressChange={(watchedEpisodes, watchProgress) => {
                    setSeries((prev) =>
                      prev ? { ...prev, watchedEpisodes, watchProgress } : prev,
                    );
                  }}
                />
              </div>
            )}

            {/* Optional: keep season-level grid */}
            <SeriesSeasonsGrid
              watchedSeasons={series.watchedSeasons || []}
              updatingSeason={updatingSeason}
              onToggle={toggleSeason}
            />
          </div>

          <SeriesSidebar series={series} />
        </div>
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
