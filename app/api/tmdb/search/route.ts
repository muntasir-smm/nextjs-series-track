// app/api/tmdb/search/route.ts

import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const page = parseInt(searchParams.get("page") || "1");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter required" },
      { status: 400 },
    );
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    const series = await Promise.all(
      data.results.slice(0, 24).map(async (show: any) => {
        const detailsResponse = await fetch(
          `${BASE_URL}/tv/${show.id}?api_key=${TMDB_API_KEY}&language=en-US`,
        );
        const details = await detailsResponse.json();

        return {
          id: show.id.toString(),
          name: show.name,
          totalSeasons: details.number_of_seasons || 0,
          upcomingSeasons: [],
          posterPath: show.poster_path,
          backdropPath: details.backdrop_path,
          voteAverage: show.vote_average,
          firstAirDate: show.first_air_date,
          overview: details.overview || show.overview || "",
        };
      }),
    );

    return NextResponse.json({
      series,
      totalResults: data.total_results,
      totalPages: data.total_pages,
      currentPage: page,
    });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from TMDB" },
      { status: 500 },
    );
  }
}
