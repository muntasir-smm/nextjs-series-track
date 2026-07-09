// app/lib/series.ts

"use server";

import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

/* =========================
   TYPES
========================= */

export interface Series {
  id: string;
  tmdbId?: number;
  name: string;
  originalName?: string;
  totalSeasons: number;
  totalEpisodes?: number;
  upcomingSeasons: string[];
  watchedSeasons: boolean[];
  watchProgress: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string | null;
  voteAverage?: number;
  voteCount?: number;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
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
  }[];
}

/* =========================
   HELPERS (V5 SECURE CORE)
========================= */

async function requireUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

/* =========================
   GET ALL SERIES
========================= */

export async function getUserSeries(): Promise<Series[]> {
  const userId = await requireUserId();

  try {
    const series = await sql`
      SELECT 
        series_id as id,
        tmdb_id as "tmdbId",
        name,
        original_name as "originalName",
        total_seasons as "totalSeasons",
        total_episodes as "totalEpisodes",
        upcoming_seasons as "upcomingSeasons",
        watched_seasons as "watchedSeasons",
        watch_progress as "watchProgress",
        poster_path as "posterPath",
        backdrop_path as "backdropPath",
        overview,
        vote_average as "voteAverage",
        vote_count as "voteCount",
        first_air_date as "firstAirDate",
        last_air_date as "lastAirDate",
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

    return series.map((s) => ({
      ...s,
      totalEpisodes: s.totalEpisodes ? Number(s.totalEpisodes) : 0,
      genres: s.genres || [],
      networks: s.networks || [],
      upcomingSeasons: s.upcomingSeasons || [],
      watchedSeasons: s.watchedSeasons || [],
      seasons:
        typeof s.seasons === "string" ? JSON.parse(s.seasons) : s.seasons || [],
    })) as Series[];
  } catch (error) {
    console.error("Error fetching user series:", error);
    return [];
  }
}

/* =========================
   FAST COUNT (NAV OPTIMIZED)
========================= */

export async function getSeriesCount(userId?: string): Promise<number> {
  const id = userId || (await auth())?.user?.id;

  if (!id) return 0;

  try {
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
   ADD SERIES
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
  const userId = await requireUserId();

  try {
    const existing = await sql`
      SELECT 1 FROM user_series
      WHERE user_id = ${userId}::uuid
      AND tmdb_id = ${tmdbId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return {
        success: false,
        duplicate: true,
        error: "Already exists in your collection",
      };
    }

    // ✅ FIXED: Use uuidv4() instead of Date.now()
    const seriesId = uuidv4();
    const watchedSeasons = Array.from({ length: totalSeasons }, () => false);

    await sql`
      INSERT INTO user_series (
        user_id,
        series_id,
        tmdb_id,
        name,
        original_name,
        total_seasons,
        total_episodes,
        upcoming_seasons,
        watched_seasons,
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
        ${tmdbId},
        ${name},
        ${originalName || null},
        ${totalSeasons},
        ${totalEpisodes || null},
        ${upcomingSeasons},
        ${watchedSeasons},
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
  } catch (error) {
    console.error("Error adding series:", error);
    return { success: false, error: "Failed to add series" };
  }
}

/* =========================
   UPDATE SERIES
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
   DELETE SERIES
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

    return { success: true };
  } catch (error) {
    console.error("Error deleting series:", error);
    return { success: false, error: "Failed to delete series" };
  }
}

/* =========================
   UPDATE WATCH PROGRESS
========================= */

export async function updateWatchProgress(
  seriesId: string,
  watchedSeasons: boolean[],
) {
  const userId = await requireUserId();

  // ✅ FIXED: Guard against division by zero
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
    `;

    revalidatePath("/dashboard/tvSeries");
    revalidatePath(`/dashboard/tvSeries/${seriesId}`);

    return { success: true, watchProgress: progress };
  } catch (error) {
    console.error("Error updating watch progress:", error);
    return { success: false, error: "Failed to update progress" };
  }
}
