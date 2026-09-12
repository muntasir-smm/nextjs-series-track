// app/api/tmdb/popular/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/app/lib/rate-limit";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 50);
      const type = (searchParams.get("type") || "tv").toLowerCase(); // tv | movie | all

      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { error: "API not configured" },
          { status: 500 },
        );
      }

      try {
        const fetchTv = async () => {
          const response = await fetch(
            `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
            { next: { revalidate: 3600 } },
          );
          if (!response.ok)
            throw new Error(`TMDB TV error: ${response.status}`);
          const data = await response.json();
          return (data.results || []).slice(0, limit).map((show: any) => ({
            id: String(show.id),
            tmdbId: show.id,
            mediaType: "tv" as const,
            name: show.name,
            totalSeasons: show.number_of_seasons || 0,
            overview: show.overview || "",
            posterPath: show.poster_path,
            backdropPath: show.backdrop_path,
            firstAirDate: show.first_air_date || null,
            voteAverage: show.vote_average || 0,
            voteCount: show.vote_count || 0,
            popularity: show.popularity || 0,
          }));
        };

        const fetchMovies = async () => {
          const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
            { next: { revalidate: 3600 } },
          );
          if (!response.ok)
            throw new Error(`TMDB movie error: ${response.status}`);
          const data = await response.json();
          return (data.results || []).slice(0, limit).map((m: any) => ({
            id: String(m.id),
            tmdbId: m.id,
            mediaType: "movie" as const,
            name: m.title,
            totalSeasons: 0,
            overview: m.overview || "",
            posterPath: m.poster_path,
            backdropPath: m.backdrop_path,
            releaseDate: m.release_date || null,
            voteAverage: m.vote_average || 0,
            voteCount: m.vote_count || 0,
            popularity: m.popularity || 0,
          }));
        };

        if (type === "movie") {
          const movies = await fetchMovies();
          return NextResponse.json({ series: [], movies, results: movies });
        }

        if (type === "all") {
          const per = Math.max(1, Math.ceil(limit / 2));
          const [tv, movies] = await Promise.all([
            fetchTv().then((list) => list.slice(0, per)),
            fetchMovies().then((list) => list.slice(0, per)),
          ]);
          // Interleave roughly by popularity
          const mixed = [...tv, ...movies].sort(
            (a, b) => (b.popularity || 0) - (a.popularity || 0),
          );
          return NextResponse.json({
            series: tv,
            movies,
            results: mixed.slice(0, limit),
          });
        }

        // default: tv
        const series = await fetchTv();
        return NextResponse.json({ series, movies: [], results: series });
      } catch (error) {
        console.error("TMDB popular error:", error);
        return NextResponse.json(
          { error: "Failed to fetch popular" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 30, windowMs: 60 * 1000 },
  );
}
