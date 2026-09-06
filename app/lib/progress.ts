// app/lib/progress.ts

import type { SeasonSummary, WatchedEpisodesMap } from "@/app/lib/definitions";

export function countWatchedEpisodes(
  map: WatchedEpisodesMap | null | undefined,
): number {
  if (!map) return 0;
  return Object.values(map).reduce((sum, eps) => sum + (eps?.length || 0), 0);
}

export function totalEpisodesFromSeasons(
  seasons: SeasonSummary[] | null | undefined,
  includeSpecials = false,
): number {
  if (!seasons?.length) return 0;
  return seasons
    .filter((s) => includeSpecials || s.seasonNumber > 0)
    .reduce((sum, s) => sum + (s.episodeCount || 0), 0);
}

export function tvWatchProgress(
  watchedEpisodes: WatchedEpisodesMap | null | undefined,
  totalEpisodes: number,
): number {
  if (!totalEpisodes || totalEpisodes <= 0) return 0;
  const watched = countWatchedEpisodes(watchedEpisodes);
  return Math.min(100, Math.round((watched / totalEpisodes) * 100));
}

export function toggleEpisodeInMap(
  map: WatchedEpisodesMap,
  seasonNumber: number,
  episodeNumber: number,
): WatchedEpisodesMap {
  const key = String(seasonNumber);
  const current = new Set(map[key] || []);
  if (current.has(episodeNumber)) {
    current.delete(episodeNumber);
  } else {
    current.add(episodeNumber);
  }
  const next = { ...map };
  const arr = Array.from(current).sort((a, b) => a - b);
  if (arr.length === 0) {
    delete next[key];
  } else {
    next[key] = arr;
  }
  return next;
}

export function markSeasonWatched(
  map: WatchedEpisodesMap,
  seasonNumber: number,
  episodeCount: number,
): WatchedEpisodesMap {
  const key = String(seasonNumber);
  const eps = Array.from({ length: episodeCount }, (_, i) => i + 1);
  return { ...map, [key]: eps };
}

export function clearSeasonWatched(
  map: WatchedEpisodesMap,
  seasonNumber: number,
): WatchedEpisodesMap {
  const next = { ...map };
  delete next[String(seasonNumber)];
  return next;
}

export function isEpisodeWatched(
  map: WatchedEpisodesMap | null | undefined,
  seasonNumber: number,
  episodeNumber: number,
): boolean {
  if (!map) return false;
  const list = map[String(seasonNumber)];
  return Array.isArray(list) && list.includes(episodeNumber);
}
