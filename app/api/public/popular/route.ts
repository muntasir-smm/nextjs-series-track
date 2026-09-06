// app/api/public/popular/route.ts

import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const revalidate = 3600;

export async function GET() {
  if (!TMDB_API_KEY) {
    return NextResponse.json({ series: [] }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      throw new Error(`TMDB error: ${response.status}`);
    }

    const data = await response.json();

    const series = (data.results || []).slice(0, 16).map((show: any) => ({
      id: String(show.id),
      name: show.name,
      posterPath: show.poster_path,
      voteAverage: show.vote_average ?? 0,
      firstAirDate: show.first_air_date || null,
      overview: show.overview || null,
      popularity: show.popularity ?? 0,
    }));

    return NextResponse.json({ series });
  } catch (error) {
    console.error("Error fetching popular series:", error);
    return NextResponse.json({ series: [] }, { status: 500 });
  }
}