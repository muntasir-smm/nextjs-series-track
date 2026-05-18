// app/api/tmdb/popular/route.ts

import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  try {
    const popularResponse = await fetch(
      `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
      {
        next: { revalidate: 3600 },
      },
    );

    // Get rate limit headers
    const rateLimitRemaining = popularResponse.headers.get(
      "x-ratelimit-remaining",
    );
    const rateLimitLimit = popularResponse.headers.get("x-ratelimit-limit");
    const rateLimitReset = popularResponse.headers.get("x-ratelimit-reset");

    const popularData = await popularResponse.json();

    const results = await Promise.allSettled(
      popularData.results.slice(0, limit).map(async (show: any) => {
        const detailsResponse = await fetch(
          `${BASE_URL}/tv/${show.id}?api_key=${TMDB_API_KEY}&language=en-US`,
          {
            next: { revalidate: 3600 },
          },
        );
        const details = await detailsResponse.json();

        const genresResponse = await fetch(
          `${BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`,
        );
        const genresData = await genresResponse.json();
        const genreMap = new Map(
          genresData.genres.map((g: any) => [g.id, g.name]),
        );

        return {
          id: show.id.toString(),
          name: show.name,
          totalSeasons: details.number_of_seasons || 0,
          upcomingSeasons: details.next_episode_to_air
            ? [`Season ${details.next_episode_to_air.season_number || "?"}`]
            : [],
          watchProgress: 0,
          posterPath: show.poster_path,
          backdropPath: details.backdrop_path,
          voteAverage: show.vote_average,
          firstAirDate: show.first_air_date,
          overview: details.overview || show.overview || "",
          status: details.status,
          genres: (details.genres || []).map((g: any) => g.name).slice(0, 2),
        };
      }),
    );

    const popularSeries = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    const response = NextResponse.json({
      series: popularSeries,
      totalResults: popularData.total_results,
      totalPages: popularData.total_pages,
      currentPage: page,
      rateLimit: {
        remaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : null,
        limit: rateLimitLimit ? parseInt(rateLimitLimit) : null,
        reset: rateLimitReset ? parseInt(rateLimitReset) : null,
      },
    });

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
