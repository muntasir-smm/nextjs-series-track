// app/api/tmdb/popular/route.ts
import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  try {
    const popularResponse = await fetch(
      `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
      {
        next: { revalidate: 3600 },
      },
    );
    const popularData = await popularResponse.json();

    const results = await Promise.allSettled(
      popularData.results.slice(0, 8).map(async (show: any) => {
        const detailsResponse = await fetch(
          `${BASE_URL}/tv/${show.id}?api_key=${TMDB_API_KEY}&language=en-US`,
          {
            next: { revalidate: 3600 },
          },
        );
        const details = await detailsResponse.json();

        return {
          id: show.id.toString(),
          name: show.name,
          totalSeasons: details.number_of_seasons || 0,
          upcomingSeasons: [],
          watchProgress:
            details.number_of_seasons > 0 ? Math.floor(Math.random() * 100) : 0,
          posterPath: show.poster_path,
          backdropPath: details.backdrop_path,
          voteAverage: show.vote_average,
          firstAirDate: show.first_air_date,
          status: details.status,
        };
      }),
    );

    const popularSeries = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    // Create response with cache headers
    const response = NextResponse.json(popularSeries);

    // Add cache headers for CDN/Vercel Edge Cache
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400",
    );

    return response;
  } catch (error) {
    console.error("TMDB popular series error:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular series" },
      { status: 500 },
    );
  }
}
