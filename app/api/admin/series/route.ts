// app/api/admin/series/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import { v4 as uuidv4 } from "uuid";

// GET - Fetch all series (admin view)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const series = await sql`
      SELECT DISTINCT ON (tmdb_id)
        series_id as id,
        tmdb_id,
        name,
        original_name as "originalName",
        total_seasons as "totalSeasons",
        total_episodes as "totalEpisodes",
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
        seasons_data as seasons,
        COUNT(*) as user_count
      FROM user_series
      GROUP BY 
        series_id, tmdb_id, name, original_name, total_seasons, total_episodes,
        poster_path, backdrop_path, overview, vote_average, vote_count,
        first_air_date, last_air_date, genres, status, tagline,
        original_language, popularity, in_production, networks, seasons_data
      ORDER BY user_count DESC, name ASC
    `;

    const parsedSeries = series.map((s) => ({
      ...s,
      genres: s.genres || [],
      networks: s.networks || [],
      seasons: s.seasons
        ? typeof s.seasons === "string"
          ? JSON.parse(s.seasons)
          : s.seasons
        : [],
    }));

    return NextResponse.json({ series: parsedSeries });
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 },
    );
  }
}

// POST - Add a new series
export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const {
      user_id,
      tmdb_id,
      name,
      total_seasons,
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
      original_name,
      original_language,
      popularity,
      in_production,
      networks,
      total_episodes,
      seasons,
    } = await request.json();

    if (!user_id || !tmdb_id || !name) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, tmdb_id, name" },
        { status: 400 },
      );
    }

    const userCheck = await sql`
      SELECT id FROM users WHERE id = ${user_id}::uuid
    `;
    if (userCheck.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await sql`
      SELECT series_id FROM user_series 
      WHERE user_id = ${user_id}::uuid AND tmdb_id = ${tmdb_id}
    `;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Series already exists for this user" },
        { status: 400 },
      );
    }

    const series_id = uuidv4();
    const watchedSeasons = Array.from(
      { length: total_seasons || 0 },
      () => false,
    );
    const watchProgress = 0;

    await sql`
      INSERT INTO user_series (
        user_id, series_id, tmdb_id, name, original_name,
        total_seasons, total_episodes, upcoming_seasons, watched_seasons, watch_progress,
        poster_path, backdrop_path, overview, vote_average, vote_count,
        first_air_date, last_air_date, genres, status, tagline,
        original_language, popularity, in_production, networks, seasons_data
      ) VALUES (
        ${user_id}::uuid, ${series_id}, ${tmdb_id}, ${name}, ${original_name || null},
        ${total_seasons || 0}, ${total_episodes || null}, '{}', ${watchedSeasons}, ${watchProgress},
        ${poster_path || null}, ${backdrop_path || null}, ${overview || null},
        ${vote_average || null}, ${vote_count || null}, ${first_air_date || null},
        ${last_air_date || null}, ${genres || null}, ${status || null}, ${tagline || null},
        ${original_language || null}, ${popularity || null}, ${in_production || null},
        ${networks || null}, ${seasons ? JSON.stringify(seasons) : null}
      )
    `;

    return NextResponse.json(
      {
        success: true,
        series_id,
        message: "Series added successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding series:", error);
    return NextResponse.json(
      { error: "Failed to add series" },
      { status: 500 },
    );
  }
}

// PUT - Update a series (SIMPLIFIED)
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      series_id,
      name,
      total_seasons,
      poster_path,
      backdrop_path,
      overview,
    } = body;

    if (!series_id) {
      return NextResponse.json(
        { error: "series_id is required" },
        { status: 400 },
      );
    }

    // Check if series exists
    const check = await sql`
      SELECT series_id FROM user_series WHERE series_id = ${series_id} LIMIT 1
    `;
    if (check.length === 0) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // Update only the fields that are provided
    await sql`
      UPDATE user_series 
      SET 
        name = ${name || null},
        total_seasons = ${total_seasons || 0},
        poster_path = ${poster_path || null},
        backdrop_path = ${backdrop_path || null},
        overview = ${overview || null}
      WHERE series_id = ${series_id}
    `;

    return NextResponse.json({
      success: true,
      message: "Series updated successfully",
    });
  } catch (error) {
    console.error("Error updating series:", error);
    return NextResponse.json(
      { error: "Failed to update series" },
      { status: 500 },
    );
  }
}

// DELETE - Remove a series
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const series_id = searchParams.get("series_id");
    const user_id = searchParams.get("user_id");

    if (!series_id) {
      return NextResponse.json(
        { error: "series_id is required" },
        { status: 400 },
      );
    }

    let result;
    if (user_id) {
      result = await sql`
        DELETE FROM user_series 
        WHERE series_id = ${series_id} AND user_id = ${user_id}::uuid
      `;
    } else {
      result = await sql`
        DELETE FROM user_series 
        WHERE series_id = ${series_id}
      `;
    }

    // FIXED: Check result length instead of rowCount
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Series removed successfully",
    });
  } catch (error) {
    console.error("Error deleting series:", error);
    return NextResponse.json(
      { error: "Failed to delete series" },
      { status: 500 },
    );
  }
}
