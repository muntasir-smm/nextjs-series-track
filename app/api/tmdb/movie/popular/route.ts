// app/api/tmdb/movie/popular/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/app/lib/rate-limit";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const page = parseInt(
        request.nextUrl.searchParams.get("page") || "1",
        10,
      );

      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { error: "API not configured" },
          { status: 500 },
        );
      }

      try {
        const response = await fetch(
          `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
          { next: { revalidate: 3600 } },
        );

        if (!response.ok) {
          throw new Error(`TMDB error: ${response.status}`);
        }

        const data = await response.json();

        const results = (data.results || []).map((m: any) => ({
          id: String(m.id),
          tmdbId: m.id,
          mediaType: "movie" as const,
          name: m.title,
          overview: m.overview || "",
          posterPath: m.poster_path,
          backdropPath: m.backdrop_path,
          releaseDate: m.release_date || null,
          voteAverage: m.vote_average || 0,
          voteCount: m.vote_count || 0,
          popularity: m.popularity || 0,
        }));

        return NextResponse.json({
          results,
          totalResults: data.total_results || 0,
          totalPages: data.total_pages || 0,
          currentPage: page,
        });
      } catch (error) {
        console.error("Movie popular error:", error);
        return NextResponse.json(
          { error: "Failed to fetch popular movies" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 30, windowMs: 60 * 1000 },
  );
}
