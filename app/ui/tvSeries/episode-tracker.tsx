// app/ui/tvSeries/episode-tracker.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  toggleEpisodeWatched,
  setSeasonEpisodesWatched,
} from "@/app/lib/series";
import { isEpisodeWatched } from "@/app/lib/progress";
import type { WatchedEpisodesMap } from "@/app/lib/definitions";
import clsx from "clsx";

interface SeasonSummary {
  seasonNumber: number;
  name?: string;
  episodeCount: number;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  episodeNumber: number;
  seasonNumber: number;
  airDate: string | null;
  runtime: number | null;
  stillPath: string | null;
  voteAverage: number;
}

interface EpisodeTrackerProps {
  seriesId: string;
  tmdbId: number;
  seasons: SeasonSummary[];
  totalEpisodes: number;
  watchedEpisodes: WatchedEpisodesMap;
  onProgressChange?: (
    watchedEpisodes: WatchedEpisodesMap,
    watchProgress: number,
  ) => void;
}

export default function EpisodeTracker({
  seriesId,
  tmdbId,
  seasons,
  totalEpisodes,
  watchedEpisodes: initialMap,
  onProgressChange,
}: EpisodeTrackerProps) {
  const [map, setMap] = useState<WatchedEpisodesMap>(initialMap || {});
  const [openSeason, setOpenSeason] = useState<number | null>(
    seasons[0]?.seasonNumber ?? null,
  );
  const [episodesBySeason, setEpisodesBySeason] = useState<
    Record<number, Episode[]>
  >({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    setMap(initialMap || {});
  }, [initialMap]);

  const loadSeason = useCallback(
    async (seasonNumber: number) => {
      if (episodesBySeason[seasonNumber]) return;
      setLoadingSeason(seasonNumber);
      try {
        const res = await fetch(
          `/api/tmdb/tv/${tmdbId}/season/${seasonNumber}`,
        );
        if (!res.ok) throw new Error("Failed to load season");
        const data = await res.json();
        setEpisodesBySeason((prev) => ({
          ...prev,
          [seasonNumber]: data.episodes || [],
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSeason(null);
      }
    },
    [tmdbId, episodesBySeason],
  );

  useEffect(() => {
    if (openSeason != null) {
      loadSeason(openSeason);
    }
  }, [openSeason, loadSeason]);

  const handleToggleEpisode = async (
    seasonNumber: number,
    episodeNumber: number,
  ) => {
    const key = `${seasonNumber}-${episodeNumber}`;
    if (busyKey) return;
    setBusyKey(key);

    const prev = map;
    // optimistic
    const optimistic = { ...map };
    const sk = String(seasonNumber);
    const set = new Set(optimistic[sk] || []);
    if (set.has(episodeNumber)) set.delete(episodeNumber);
    else set.add(episodeNumber);
    const arr = Array.from(set).sort((a, b) => a - b);
    if (arr.length) optimistic[sk] = arr;
    else delete optimistic[sk];
    setMap(optimistic);

    try {
      const result = await toggleEpisodeWatched(
        seriesId,
        seasonNumber,
        episodeNumber,
        totalEpisodes,
      );
      if (result.success && result.watchedEpisodes) {
        setMap(result.watchedEpisodes);
        onProgressChange?.(result.watchedEpisodes, result.watchProgress ?? 0);
      } else {
        setMap(prev);
      }
    } catch {
      setMap(prev);
    } finally {
      setBusyKey(null);
    }
  };

  const handleToggleSeason = async (
    seasonNumber: number,
    episodeCount: number,
    markAll: boolean,
  ) => {
    const key = `season-${seasonNumber}`;
    if (busyKey) return;
    setBusyKey(key);

    try {
      const result = await setSeasonEpisodesWatched(
        seriesId,
        seasonNumber,
        episodeCount,
        totalEpisodes,
        markAll,
      );
      if (result.success && result.watchedEpisodes) {
        setMap(result.watchedEpisodes);
        onProgressChange?.(result.watchedEpisodes, result.watchProgress ?? 0);
      }
    } finally {
      setBusyKey(null);
    }
  };

  if (!seasons?.length) {
    return (
      <p className="text-sm text-slate-500">
        No season data available for episode tracking.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Episode tracker
      </h3>

      {seasons.map((season) => {
        const sn = season.seasonNumber;
        const isOpen = openSeason === sn;
        const eps = episodesBySeason[sn] || [];
        const watchedInSeason = (map[String(sn)] || []).length;
        const count = season.episodeCount || eps.length;
        const allDone = count > 0 && watchedInSeason >= count;

        return (
          <div
            key={sn}
            className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => setOpenSeason(isOpen ? null : sn)}
              className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left dark:bg-slate-800/60"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {season.name || `Season ${sn}`}
                </p>
                <p className="text-xs text-slate-500">
                  {watchedInSeason}/{count || "?"} episodes
                </p>
              </div>
              <ChevronDownIcon
                className={clsx(
                  "h-5 w-5 text-slate-400 transition",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t border-slate-200 p-3 dark:border-slate-700">
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() => handleToggleSeason(sn, count, !allDone)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {allDone ? "Clear season" : "Mark season watched"}
                  </button>
                </div>

                {loadingSeason === sn ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  </div>
                ) : eps.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No episodes found
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {eps.map((ep) => {
                      const watched = isEpisodeWatched(
                        map,
                        sn,
                        ep.episodeNumber,
                      );
                      const key = `${sn}-${ep.episodeNumber}`;
                      return (
                        <li key={ep.id}>
                          <button
                            type="button"
                            disabled={busyKey !== null}
                            onClick={() =>
                              handleToggleEpisode(sn, ep.episodeNumber)
                            }
                            className={clsx(
                              "flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800",
                              busyKey === key && "opacity-60",
                            )}
                          >
                            <span
                              className={clsx(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                                watched
                                  ? "border-brand-600 bg-brand-600 text-white"
                                  : "border-slate-300 dark:border-slate-600",
                              )}
                            >
                              {watched && <CheckIcon className="h-3.5 w-3.5" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-slate-900 dark:text-white">
                                E{ep.episodeNumber}. {ep.name}
                              </span>
                              {ep.airDate && (
                                <span className="text-xs text-slate-500">
                                  {ep.airDate}
                                  {ep.runtime ? ` · ${ep.runtime}m` : ""}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
