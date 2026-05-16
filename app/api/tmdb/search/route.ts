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
    // First, search for shows
    const searchResponse = await fetch(
      `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`,
    );
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      throw new Error(`TMDB API error: ${searchResponse.status}`);
    }

    // Then fetch full details for each show to get number_of_seasons
    const series = await Promise.all(
      searchData.results.slice(0, 10).map(async (show: any) => {
        // Fetch full details for this specific show
        const detailsResponse = await fetch(
          `${BASE_URL}/tv/${show.id}?api_key=${TMDB_API_KEY}&language=en-US`,
        );
        const details = await detailsResponse.json();

        return {
          id: show.id.toString(),
          name: show.name,
          totalSeasons: details.number_of_seasons || 0, // ✅ Now we get it!
          overview: details.overview || "",
          posterPath: show.poster_path,
          backdropPath: details.backdrop_path,
          firstAirDate: show.first_air_date,
          voteAverage: show.vote_average,
          status: details.status,
        };
      }),
    );

    return NextResponse.json({
      series,
      totalResults: searchData.total_results,
      totalPages: searchData.total_pages,
    });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from TMDB" },
      { status: 500 },
    );
  }
}
