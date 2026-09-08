// app/lib/series.ts

"use server";

import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { cache } from "react";
import {
  countWatchedEpisodes,
  tvWatchProgress,
  toggleEpisodeInMap,
  markSeasonWatched,
  clearSeasonWatched,
} from "@/app/lib/progress";
import type { WatchedEpisodesMap } from "@/app/lib/definitions";

/* =========================
   TYPES
========================= */

export type MediaType = "movie" | "tv";

export interface Series {
  id: string;
  mediaType?: MediaType;
  tmdbId?: number;
  name: string;
  originalName?: string;
  totalSeasons: number;
  totalEpisodes?: number;
  upcomingSeasons: string[];
  watchedSeasons: boolean[];
  /** season → episode numbers watched, e.g. { "1": [1,2,5] } */
  watchedEpisodes?: WatchedEpisodesMap;
  watchProgress: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string | null;
  voteAverage?: number;
  voteCount?: number;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  watched?: boolean;
  genres?: string[];
  status?: string;
  tagline?: string;
  originalLanguage?: string;
  popularity?: number;
  inProduction?: boolean;
  networks?: string[];
  seasons?: {
    seasonNumber: number;
    episodeCount: number;
    airDate?: string;
    overview?: string;
    posterPath?: string | null;
    name?: string;
  }[];
}

/* =========================
   HELPERS
========================= */

const getSession = cache(async () => {
  return await auth();
});

async function requireUserId(): Promise<string> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }
    return session.user.id;
  } catch (error) {
    console.error("Auth error:", error);
    throw new Error("UNAUTHORIZED");
  }
}

function parseWatchedEpisodes(raw: unknown): WatchedEpisodesMap {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as WatchedEpisodesMap;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as WatchedEpisodesMap;
  return {};
}

function mapRow(s: any): Series {
  const watchedEpisodes = parseWatchedEpisodes(s.watchedEpisodes);
  const seasons =
    typeof s.seasons === "string" ? JSON.parse(s.seasons) : s.seasons || [];
  const totalEpisodes = s.totalEpisodes != null ? Number(s.totalEpisodes) : 0;
  const totalSeasons = s.totalSeasons != null ? Number(s.totalSeasons) : 0;

  const episodeWatchedCount = countWatchedEpisodes(watchedEpisodes);
  let watchProgress = Number(s.watchProgress) || 0;
  if (episodeWatchedCount > 0 && totalEpisodes > 0) {
    watchProgress = tvWatchProgress(watchedEpisodes, totalEpisodes);
  }

  const voteAverage =
    s.voteAverage != null && s.voteAverage !== ""
      ? Number(s.voteAverage)
      : undefined;

  return {
    ...s,
    mediaType: (s.mediaType as MediaType) || "tv",
    tmdbId: s.tmdbId != null ? Number(s.tmdbId) : undefined,
    totalSeasons,
    totalEpisodes,
    voteAverage: Number.isFinite(voteAverage as number)
      ? (voteAverage as number)
      : undefined,
    voteCount: s.voteCount != null ? Number(s.voteCount) : undefined,
    popularity: s.popularity != null ? Number(s.popularity) : undefined,
    runtime: s.runtime != null ? Number(s.runtime) : null,
    genres: s.genres || [],
    networks: s.networks || [],
    upcomingSeasons: s.upcomingSeasons || [],
    watchedSeasons: s.watchedSeasons || [],
    watchedEpisodes,
    seasons,
    watchProgress,
    watched: Boolean(s.watched),
  } as Series;
}

/* =========================
   GET ALL (library)
========================= */

export async function getUserSeries(mediaType?: MediaType): Promise<Series[]> {
  try {
    const userId = await requireUserId();

    const series =
      mediaType === "movie" || mediaType === "tv"
        ? await sql`
            SELECT 
              series_id as id,
              media_type as "mediaType",
              tmdb_id as "tmdbId",
              name,
              original_name as "originalName",
              total_seasons as "totalSeasons",
              total_episodes as "totalEpisodes",
              upcoming_seasons as "upcomingSeasons",
              watched_seasons as "watchedSeasons",
              watched_episodes as "watchedEpisodes",
              watch_progress as "watchProgress",
              poster_path as "posterPath",
              backdrop_path as "backdropPath",
              overview,
              vote_average as "voteAverage",
              vote_count as "voteCount",
              first_air_date as "firstAirDate",
              last_air_date as "lastAirDate",
              release_date as "releaseDate",
              runtime,
              watched,
              genres,
              status,
              tagline,
              original_language as "originalLanguage",
              popularity,
              in_production as "inProduction",
              networks,
              seasons_data as seasons
            FROM user_series
            WHERE user_id = ${userId}::uuid
              AND media_type = ${mediaType}
            ORDER BY created_at DESC
          `
        : await sql`
            SELECT 
              series_id as id,
              media_type as "mediaType",
              tmdb_id as "tmdbId",
              name,
              original_name as "originalName",
              total_seasons as "totalSeasons",
              total_episodes as "totalEpisodes",
              upcoming_seasons as "upcomingSeasons",
              watched_seasons as "watchedSeasons",
              watched_episodes as "watchedEpisodes",
              watch_progress as "watchProgress",
              poster_path as "posterPath",
              backdrop_path as "backdropPath",
              overview,
              vote_average as "voteAverage",
              vote_count as "voteCount",
              first_air_date as "firstAirDate",
              last_air_date as "lastAirDate",
              release_date as "releaseDate",
              runtime,
              watched,
              genres,
              status,
              tagline,
              original_language as "originalLanguage",
              popularity,
              in_production as "inProduction",
              networks,
              seasons_data as seasons
            FROM user_series
            WHERE user_id = ${userId}::uuid
            ORDER BY created_at DESC
          `;

    return series.map(mapRow);
  } catch (error) {
    console.error("Error fetching user series:", error);
    return [];
  }
}

/* =========================
   FAST COUNT
========================= */

export async function getSeriesCount(
  userId?: string,
  mediaType?: MediaType,
): Promise<number> {
  try {
    const id = userId || (await auth())?.user?.id;
    if (!id) return 0;

    if (mediaType === "movie" || mediaType === "tv") {
      const result = await sql`
        SELECT COUNT(*)::int as count
        FROM user_series
        WHERE user_id = ${id}::uuid
          AND media_type = ${mediaType}
      `;
      return result?.[0]?.count ?? 0;
    }

    const result = await sql`
      SELECT COUNT(*)::int as count
      FROM user_series
      WHERE user_id = ${id}::uuid
    `;
    return result?.[0]?.count ?? 0;
  } catch (error) {
    console.error("Error fetching series count:", error);
    return 0;
  }
}

/* =========================
   ADD TV SERIES
========================= */

export async function addSeries(
  tmdbId: number,
  name: string,
  totalSeasons: number,
  upcomingSeasons: string[],
  posterPath?: string | null,
  backdropPath?: string | null,
  overview?: string | null,
  voteAverage?: number,
  voteCount?: number,
  firstAirDate?: string | null,
  lastAirDate?: string | null,
  genres?: string[],
  status?: string,
  tagline?: string,
  originalName?: string,
  originalLanguage?: string,
  popularity?: number,
  inProduction?: boolean,
  networks?: string[],
  totalEpisodes?: number,
  seasons?: any[],
) {
  try {
    const userId = await requireUserId();

    // Duplicate = same user + same TMDB id + TV
    const existing = await sql`
      SELECT 1 FROM user_series
      WHERE user_id = ${userId}::uuid
        AND tmdb_id = ${tmdbId}
        AND media_type = 'tv'
      LIMIT 1
    `;

    if (existing.length > 0) {
      return {
        success: false,
        duplicate: true,
        error: "Already exists in your collection",
      };
    }

    const seriesId = uuidv4();
    const watchedSeasons = Array.from({ length: totalSeasons }, () => false);

    await sql`
      INSERT INTO user_series (
        user_id,
        series_id,
        media_type,
        tmdb_id,
        name,
        original_name,
        total_seasons,
        total_episodes,
        upcoming_seasons,
        watched_seasons,
        watched_episodes,
        watch_progress,
        poster_path,
        backdrop_path,
        overview,
        vote_average,
        vote_count,
        first_air_date,
        last_air_date,
        genres,
        status,
        tagline,
        original_language,
        popularity,
        in_production,
        networks,
        seasons_data
      ) VALUES (
        ${userId}::uuid,
        ${seriesId},
        'tv',
        ${tmdbId},
        ${name},
        ${originalName || null},
        ${totalSeasons},
        ${totalEpisodes || null},
        ${upcomingSeasons},
        ${watchedSeasons},
        ${JSON.stringify({})},
        0,
        ${posterPath || null},
        ${backdropPath || null},
        ${overview || null},
        ${voteAverage || null},
        ${voteCount || null},
        ${firstAirDate || null},
        ${lastAirDate || null},
        ${genres || null},
        ${status || null},
        ${tagline || null},
        ${originalLanguage || null},
        ${popularity || null},
        ${inProduction || null},
        ${networks || null},
        ${seasons ? JSON.stringify(seasons) : null}
      )
    `;

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tvSeries");

    return { success: true, seriesId };
  } catch (error: any) {
    // Unique index violation
    if (error?.code === "23505") {
      return {
        success: false,
        duplicate: true,
        error: "Already exists in your collection",
      };
    }
    console.error("Error adding series:", error);
    return { success: false, error: "Failed to add series" };
  }
}

/* =========================
   GET ONE BY series_id
========================= */

export async function getUserMediaById(
  seriesId: string,
): Promise<Series | null> {
  try {
    const userId = await requireUserId();

    const rows = await sql`
      SELECT 
        series_id as id,
        media_type as "mediaType",
        tmdb_id as "tmdbId",
        name,
        original_name as "originalName",
        total_seasons as "totalSeasons",
        total_episodes as "totalEpisodes",
        upcoming_seasons as "upcomingSeasons",
        watched_seasons as "watchedSeasons",
        watched_episodes as "watchedEpisodes",
        watch_progress as "watchProgress",
        poster_path as "posterPath",
        backdrop_path as "backdropPath",
        overview,
        vote_average as "voteAverage",
        vote_count as "voteCount",
        first_air_date as "firstAirDate",
        last_air_date as "lastAirDate",
        release_date as "releaseDate",
        runtime,
        watched,
        genres,
        status,
        tagline,
        original_language as "originalLanguage",
        popularity,
        in_production as "inProduction",
        networks,
        seasons_data as seasons
      FROM user_series
      WHERE user_id = ${userId}::uuid
        AND series_id = ${seriesId}
      LIMIT 1
    `;

    if (!rows.length) return null;
    return mapRow(rows[0]);
  } catch (error) {
    console.error("Error fetching media by id:", error);
    return null;
  }
}

/** Check if user already has this TMDB title */
export async function isInLibrary(
  tmdbId: number,
  mediaType: MediaType,
): Promise<boolean> {
  try {
    const userId = await requireUserId();
    const rows = await sql`
      SELECT 1 FROM user_series
      WHERE user_id = ${userId}::uuid
        AND tmdb_id = ${tmdbId}
        AND media_type = ${mediaType}
      LIMIT 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}

/* =========================
   ADD MOVIE
========================= */

export async function addMovie(input: {
  tmdbId: number;
  name: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  voteCount?: number;
  releaseDate?: string | null;
  runtime?: number | null;
  genres?: string[];
  status?: string;
  tagline?: string;
  originalName?: string;
  originalLanguage?: string;
  popularity?: number;
}) {
  try {
    const userId = await requireUserId();

    const existing = await sql`
      SELECT 1 FROM user_series
      WHERE user_id = ${userId}::uuid
        AND tmdb_id = ${input.tmdbId}
        AND media_type = 'movie'
      LIMIT 1
    `;

    if (existing.length > 0) {
      return {
        success: false,
        duplicate: true,
        error: "Already exists in your collection",
      };
    }

    const seriesId = uuidv4();

    await sql`
      INSERT INTO user_series (
        user_id,
        series_id,
        media_type,
        tmdb_id,
        name,
        original_name,
        total_seasons,
        total_episodes,
        upcoming_seasons,
        watched_seasons,
        watched_episodes,
        watch_progress,
        poster_path,
        backdrop_path,
        overview,
        vote_average,
        vote_count,
        release_date,
        runtime,
        watched,
        genres,
        status,
        tagline,
        original_language,
        popularity
      ) VALUES (
        ${userId}::uuid,
        ${seriesId},
        'movie',
        ${input.tmdbId},
        ${input.name},
        ${input.originalName || null},
        0,
        0,
        ${[]},
        ${[]},
        ${JSON.stringify({})},
        0,
        ${input.posterPath || null},
        ${input.backdropPath || null},
        ${input.overview || null},
        ${input.voteAverage || null},
        ${input.voteCount || null},
        ${input.releaseDate || null},
        ${input.runtime || null},
        false,
        ${input.genres || null},
        ${input.status || null},
        ${input.tagline || null},
        ${input.originalLanguage || null},
        ${input.popularity || null}
      )
    `;

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tvSeries");

    return { success: true, seriesId };
  } catch (error: any) {
    if (error?.code === "23505") {
      return {
        success: false,
        duplicate: true,
        error: "Already exists in your collection",
      };
    }
    console.error("Error adding movie:", error);
    return { success: false, error: "Failed to add movie" };
  }
}

/* =========================
   UPDATE SERIES (metadata / season-level)
========================= */

export async function updateSeries(updated: Series) {
  const userId = await requireUserId();

  try {
    await sql`
      UPDATE user_series
      SET 
        name = ${updated.name},
        total_seasons = ${updated.totalSeasons},
        upcoming_seasons = ${updated.upcomingSeasons},
        watched_seasons = ${updated.watchedSeasons},
        watch_progress = ${Math.round(updated.watchProgress)},
        poster_path = ${updated.posterPath || null},
        backdrop_path = ${updated.backdropPath || null},
        overview = ${updated.overview || null}
      WHERE user_id = ${userId}::uuid
        AND series_id = ${updated.id}
    `;

    revalidatePath("/dashboard/tvSeries");
    return { success: true };
  } catch (error) {
    console.error("Error updating series:", error);
    return { success: false, error: "Failed to update series" };
  }
}

/* =========================
   DELETE
========================= */

export async function deleteSeries(seriesId: string) {
  const userId = await requireUserId();

  try {
    await sql`
      DELETE FROM user_series
      WHERE user_id = ${userId}::uuid
        AND series_id = ${seriesId}
    `;

    revalidatePath("/dashboard/tvSeries");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting series:", error);
    return { success: false, error: "Failed to delete series" };
  }
}

/* =========================
   SEASON-LEVEL PROGRESS (legacy UI)
========================= */

export async function updateWatchProgress(
  seriesId: string,
  watchedSeasons: boolean[],
) {
  const userId = await requireUserId();

  if (!watchedSeasons || watchedSeasons.length === 0) {
    return { success: true, watchProgress: 0 };
  }

  const progress = Math.round(
    (watchedSeasons.filter(Boolean).length / watchedSeasons.length) * 100,
  );

  try {
    await sql`
      UPDATE user_series
      SET 
        watched_seasons = ${watchedSeasons},
        watch_progress = ${progress}
      WHERE user_id = ${userId}::uuid
        AND series_id = ${seriesId}
        AND media_type = 'tv'
    `;

    revalidatePath("/dashboard/tvSeries");
    revalidatePath(`/dashboard/tvSeries/${seriesId}`);

    return { success: true, watchProgress: progress };
  } catch (error) {
    console.error("Error updating watch progress:", error);
    return { success: false, error: "Failed to update progress" };
  }
}

/* =========================
   EPISODE-LEVEL PROGRESS (TV)
========================= */

export async function toggleEpisodeWatched(
  seriesId: string,
  seasonNumber: number,
  episodeNumber: number,
  totalEpisodes: number,
) {
  const userId = await requireUserId();

  try {
    const rows = await sql`
      SELECT watched_episodes as "watchedEpisodes"
      FROM user_series
      WHERE user_id = ${userId}::uuid
        AND series_id = ${seriesId}
        AND media_type = 'tv'
      LIMIT 1
    `;

    if (!rows.length) {
      return { success: false, error: "Series not found" };
    }

    const current = parseWatchedEpisodes(rows[0].watchedEpisodes);
    const next = toggleEpisodeInMap(current, seasonNumber, episodeNumber);
    const progress = tvWatchProgress(next, totalEpisodes);

    await sql`
      UPDATE user_series
      SET
        watched_episodes = ${JSON.stringify(next)}::jsonb,
        watch_progress = ${progress}
      WHERE user_id = ${userId}::uuid
        AND series_id = ${seriesId}
    `;

    revalidatePath("/dashboard/tvSeries");
    revalidatePath(`/dashboard/tvSeries/${seriesId}`);

    return { success: true, watchedEpisodes: next, watchProgress: progress };
  } catch (error) {
    console.error("Error toggling episode:", error);
    return { success: false, error: "Failed to update episode" };
  }
}

export async function setSeasonEpisodesWatched(
  seriesId: string,
  seasonNumber: number,
  episodeCount: number,
  totalEpisodes: number,
  watched: boolean,
) {
  const userId = await requireUserId();

  try {
    const rows = await sql`
      SELECT watched_episodes as "watchedEpisodes"
      FROM user_series
      WHERE user_id = ${userId}::uuid
        AND series_id = ${seriesId}
        AND media_type = 'tv'
      LIMIT 1
    `;

    if (!rows.length) {
      return { success: false, error: "Series not found" };
    }

    const current = parseWatchedEpisodes(rows[0].watchedEpisodes);
    const next = watched
      ? markSeasonWatched(current, seasonNumber, episodeCount)
      : clearSeasonWatched(current, seasonNumber);
    const progress = tvWatchProgress(next, totalEpisodes);

    await sql`
      UPDATE user_series
      SET
        watched_episodes = ${JSON.stringify(next)}::jsonb,
        watch_progress = ${progress}
      WHERE user_id = ${userId}::uuid
        AND series_id = ${seriesId}
    `;

    revalidatePath("/dashboard/tvSeries");
    revalidatePath(`/dashboard/tvSeries/${seriesId}`);

    return { success: true, watchedEpisodes: next, watchProgress: progress };
  } catch (error) {
    console.error("Error updating season episodes:", error);
    return { success: false, error: "Failed to update season" };
  }
}

/* =========================
   MOVIE WATCHED TOGGLE
========================= */

export async function toggleMovieWatched(seriesId: string, watched: boolean) {
  const userId = await requireUserId();

  try {
    await sql`
      UPDATE user_series
      SET
        watched = ${watched},
        watched_at = ${watched ? new Date().toISOString() : null},
        watch_progress = ${watched ? 100 : 0}
      WHERE user_id = ${userId}::uuid
        AND series_id = ${seriesId}
        AND media_type = 'movie'
    `;

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tvSeries");

    return { success: true, watched, watchProgress: watched ? 100 : 0 };
  } catch (error) {
    console.error("Error toggling movie watched:", error);
    return { success: false, error: "Failed to update movie" };
  }
}
