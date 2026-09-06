// app/api/tmdb/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/app/lib/rate-limit";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

type SearchType = "tv" | "movie" | "multi";

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const searchParams = request.nextUrl.searchParams;
      const query = searchParams.get("query");
      const page = parseInt(searchParams.get("page") || "1");
      const type = (searchParams.get("type") || "tv") as SearchType;

      if (!query?.trim()) {
        return NextResponse.json(
          { error: "Query parameter required" },
          { status: 400 },
        );
      }

      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { error: "API not configured" },
          { status: 500 },
        );
      }

      const endpoint =
        type === "movie"
          ? "search/movie"
          : type === "multi"
            ? "search/multi"
            : "search/tv";

      try {
        const response = await fetch(
          `${BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
            query,
          )}&language=en-US&page=${page}&include_adult=false`,
          { next: { revalidate: 3600 } },
        );

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        const results = (data.results || [])
          .filter((item: any) => {
            if (type !== "multi") return true;
            return item.media_type === "movie" || item.media_type === "tv";
          })
          .slice(0, 24)
          .map((item: any) => {
            const mediaType =
              type === "multi"
                ? item.media_type
                : type === "movie"
                  ? "movie"
                  : "tv";

            if (mediaType === "movie") {
              return {
                id: item.id,
                mediaType: "movie" as const,
                name: item.title || item.name,
                overview: item.overview || "",
                posterPath: item.poster_path,
                backdropPath: item.backdrop_path,
                releaseDate: item.release_date || null,
                voteAverage: item.vote_average || 0,
                voteCount: item.vote_count || 0,
                popularity: item.popularity || 0,
                originalLanguage: item.original_language,
              };
            }

            return {
              id: item.id,
              mediaType: "tv" as const,
              name: item.name || item.title,
              overview: item.overview || "",
              posterPath: item.poster_path,
              backdropPath: item.backdrop_path,
              firstAirDate: item.first_air_date || null,
              voteAverage: item.vote_average || 0,
              voteCount: item.vote_count || 0,
              popularity: item.popularity || 0,
              originalLanguage: item.original_language,
              // Season count not on search — fetch details on add
              totalSeasons: item.number_of_seasons || 0,
            };
          });

        return NextResponse.json({
          results,
          // Legacy key for existing TV UI
          series: results.filter((r: any) => r.mediaType === "tv"),
          totalResults: data.total_results || 0,
          totalPages: data.total_pages || 0,
          currentPage: page,
        });
      } catch (error) {
        console.error("TMDB search error:", error);
        return NextResponse.json(
          { error: "Failed to fetch from TMDB" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 30, windowMs: 60 * 1000 },
  );
}
