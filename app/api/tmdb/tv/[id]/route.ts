// app/api/tmdb/tv/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      id: data.id.toString(),
      name: data.name,
      totalSeasons: data.number_of_seasons || 0,
      overview: data.overview || "",
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      firstAirDate: data.first_air_date,
      voteAverage: data.vote_average,
      status: data.status,
    });
  } catch (error) {
    console.error("TMDB TV details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch series details" },
      { status: 500 },
    );
  }
}
