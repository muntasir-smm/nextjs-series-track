// app/api/tmdb/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/app/lib/rate-limit";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
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
        return NextResponse.json(
          { error: "API not configured" },
          { status: 500 },
        );
      }

      try {
        const response = await fetch(
          `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
            query,
          )}&language=en-US&page=${page}`,
          {
            next: { revalidate: 3600 }, // Cache search results for 1 hour
          },
        );

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();

        // Fetch season counts efficiently with Promise.all (limited to first 24 results)
        const seriesWithSeasons = await Promise.all(
          data.results.slice(0, 24).map(async (show: any) => {
            // If number_of_seasons is already in search result, use it
            if (show.number_of_seasons && show.number_of_seasons > 0) {
              return {
                id: show.id,
                name: show.name,
                totalSeasons: show.number_of_seasons,
                overview: show.overview || "",
                posterPath: show.poster_path,
                backdropPath: show.backdrop_path,
                firstAirDate: show.first_air_date || "",
                voteAverage: show.vote_average || 0,
              };
            }

            // Otherwise fetch details (but only for shows missing season data)
            try {
              const detailsResponse = await fetch(
                `${BASE_URL}/tv/${show.id}?api_key=${TMDB_API_KEY}&language=en-US`,
                {
                  next: { revalidate: 86400 }, // Cache details for 24 hours
                },
              );
              const details = await detailsResponse.json();

              return {
                id: show.id,
                name: show.name,
                totalSeasons: details.number_of_seasons || 0,
                overview: show.overview || "",
                posterPath: show.poster_path,
                backdropPath: show.backdrop_path || details.backdrop_path,
                firstAirDate: show.first_air_date || "",
                voteAverage: show.vote_average || 0,
              };
            } catch {
              // Fallback if details fetch fails
              return {
                id: show.id,
                name: show.name,
                totalSeasons: 0,
                overview: show.overview || "",
                posterPath: show.poster_path,
                backdropPath: show.backdrop_path,
                firstAirDate: show.first_air_date || "",
                voteAverage: show.vote_average || 0,
              };
            }
          }),
        );

        return NextResponse.json({
          series: seriesWithSeasons,
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
    },
    { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  );
}
