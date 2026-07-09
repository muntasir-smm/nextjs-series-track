// app/api/tmdb/popular/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/app/lib/rate-limit";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Cache for genres to avoid repeated API calls
let cachedGenres: Map<number, string> | null = null;
let lastGenreFetch = 0;
const GENRE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getGenreMap(): Promise<Map<number, string>> {
  const now = Date.now();

  // Return cached genres if valid
  if (cachedGenres && now - lastGenreFetch < GENRE_CACHE_TTL) {
    return cachedGenres;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch genres:", response.status);
      return cachedGenres || new Map();
    }

    const data = await response.json();
    const genreMap = new Map<number, string>();
    data.genres?.forEach((genre: any) => {
      genreMap.set(genre.id, genre.name);
    });

    cachedGenres = genreMap;
    lastGenreFetch = now;

    return genreMap;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return cachedGenres || new Map();
  }
}

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 50);

      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { error: "API not configured" },
          { status: 500 },
        );
      }

      try {
        // Fetch popular TV series
        const response = await fetch(
          `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
          {
            next: { revalidate: 3600 }, // Cache for 1 hour
          },
        );

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();

        // Fetch genre map once (not in the loop!)
        const genreMap = await getGenreMap();

        // Map genres to names
        const series = (data.results || []).slice(0, limit).map((show: any) => {
          const genreNames = (show.genre_ids || []).map(
            (id: number) => genreMap.get(id) || id.toString(),
          );

          return {
            id: show.id.toString(),
            name: show.name,
            totalSeasons: show.number_of_seasons || 0,
            overview: show.overview || "",
            posterPath: show.poster_path,
            backdropPath: show.backdrop_path,
            firstAirDate: show.first_air_date || "",
            voteAverage: show.vote_average || 0,
            voteCount: show.vote_count || 0,
            genres: genreNames,
            originalLanguage: show.original_language,
            popularity: show.popularity || 0,
            genreIds: show.genre_ids || [],
          };
        });

        return NextResponse.json({
          series,
          totalResults: data.total_results || 0,
          totalPages: data.total_pages || 0,
          currentPage: page,
        });
      } catch (error) {
        console.error("TMDB popular error:", error);
        return NextResponse.json(
          { error: "Failed to fetch popular series" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  );
}
