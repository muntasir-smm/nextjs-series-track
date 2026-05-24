// app/lib/series.ts

"use server";

import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export interface Series {
  id: string;
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

// Get all series for the current user

export async function getUserSeries(): Promise<Series[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    // First, get all existing columns
    const series = await sql`
      SELECT 
        series_id as id,
        name,
        total_seasons as "totalSeasons",
        upcoming_seasons as "upcomingSeasons",
        watched_seasons as "watchedSeasons",
        watch_progress as "watchProgress",
        poster_path as "posterPath",
        backdrop_path as "backdropPath",
        overview
      FROM user_series
      WHERE user_id = ${session.user.id}::uuid
      ORDER BY created_at DESC
    `;

    return series as Series[];
  } catch (error) {
    console.error("Error fetching user series:", error);
    return [];
  }
}

// Add a new series
export async function addSeries(
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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const seriesId = `series-${Date.now()}`;
  const watchedSeasons = Array.from({ length: totalSeasons }, () => false);
  const watchProgress = 0;

  try {
    await sql`
      INSERT INTO user_series (
        user_id, 
        series_id, 
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
        ${session.user.id}::uuid,
        ${seriesId},
        ${name},
        ${originalName || null},
        ${totalSeasons},
        ${totalEpisodes || null},
        ${upcomingSeasons},
        ${watchedSeasons},
        ${watchProgress},
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

// Update series
export async function updateSeries(updatedSeries: Series) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const roundedProgress = Math.round(updatedSeries.watchProgress);

  try {
    await sql`
      UPDATE user_series
      SET 
        name = ${updatedSeries.name},
        total_seasons = ${updatedSeries.totalSeasons},
        upcoming_seasons = ${updatedSeries.upcomingSeasons},
        watched_seasons = ${updatedSeries.watchedSeasons},
        watch_progress = ${roundedProgress},
        poster_path = ${updatedSeries.posterPath || null},
        backdrop_path = ${updatedSeries.backdropPath || null},
        overview = ${updatedSeries.overview || null}
      WHERE user_id = ${session.user.id}::uuid
      AND series_id = ${updatedSeries.id}
    `;

    revalidatePath("/dashboard/tvSeries");
    return { success: true };
  } catch (error) {
    console.error("Error updating series:", error);
    return { success: false, error: "Failed to update series" };
  }
}

// Delete a series
export async function deleteSeries(seriesId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    await sql`
      DELETE FROM user_series
      WHERE user_id = ${session.user.id}::uuid
      AND series_id = ${seriesId}
    `;

    revalidatePath("/dashboard/tvSeries");
    return { success: true };
  } catch (error) {
    console.error("Error deleting series:", error);
    return { success: false, error: "Failed to delete series" };
  }
}

// Update watch progress for a series
export async function updateWatchProgress(
  seriesId: string,
  watchedSeasons: boolean[],
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const watchProgress = Math.round(
    (watchedSeasons.filter((watched) => watched).length /
      watchedSeasons.length) *
      100,
  );

  try {
    await sql`
      UPDATE user_series
      SET 
        watched_seasons = ${watchedSeasons},
        watch_progress = ${watchProgress}
      WHERE user_id = ${session.user.id}::uuid
      AND series_id = ${seriesId}
    `;

    return { success: true, watchProgress };
  } catch (error) {
    console.error("Error updating watch progress:", error);
    return { success: false, error: "Failed to update progress" };
  }
}
