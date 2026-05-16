// app/api/tmdb/search/route.ts

import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter required" },
      { status: 400 },
    );
  }

  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY is missing");
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform TMDB data to our format
    const series = data.results.map((show: any) => ({
      id: show.id.toString(),
      name: show.name,
      totalSeasons: show.number_of_seasons || 0,
      overview: show.overview || "",
      posterPath: show.poster_path,
      backdropPath: show.backdrop_path,
      firstAirDate: show.first_air_date,
      voteAverage: show.vote_average,
      originalLanguage: show.original_language,
    }));

    return NextResponse.json({
      series,
      totalResults: data.total_results,
      totalPages: data.total_pages,
    });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from TMDB" },
      { status: 500 },
    );
  }
}
