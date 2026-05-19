// app/api/public/popular/route.ts

import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  if (!TMDB_API_KEY) {
    return NextResponse.json([], { status: 500 });
  }

  try {
    // Single API call - lightweight for landing page
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
      { next: { revalidate: 3600 } },
    );

    const data = await response.json();

    // Return minimal data (only what landing page needs)
    const popularSeries = data.results.slice(0, 12).map((show: any) => ({
      id: show.id.toString(),
      name: show.name,
      posterPath: show.poster_path,
      voteAverage: show.vote_average,
      firstAirDate: show.first_air_date,
    }));

    return NextResponse.json(popularSeries);
  } catch (error) {
    console.error("Error fetching popular series:", error);
    return NextResponse.json([], { status: 500 });
  }
}
