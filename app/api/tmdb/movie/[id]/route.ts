// app/api/tmdb/movie/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/app/lib/rate-limit";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withRateLimit(
    request,
    async () => {
      const { id } = await context.params;

      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { error: "API not configured" },
          { status: 500 },
        );
      }

      if (!id || Number.isNaN(Number(id))) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }

      try {
        const response = await fetch(
          `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`,
          { next: { revalidate: 86400 } },
        );

        if (!response.ok) {
          if (response.status === 404) {
            return NextResponse.json(
              { error: "Movie not found" },
              { status: 404 },
            );
          }
          throw new Error(`TMDB error: ${response.status}`);
        }

        const data = await response.json();

        const cast = (data.credits?.cast || []).slice(0, 12).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profilePath: c.profile_path,
        }));

        const crew = (data.credits?.crew || [])
          .filter((c: any) =>
            ["Director", "Writer", "Screenplay"].includes(c.job),
          )
          .slice(0, 8)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            job: c.job,
          }));

        const trailers = (data.videos?.results || [])
          .filter(
            (v: any) =>
              v.site === "YouTube" &&
              (v.type === "Trailer" || v.type === "Teaser"),
          )
          .slice(0, 3)
          .map((v: any) => ({
            key: v.key,
            name: v.name,
            type: v.type,
          }));

        return NextResponse.json({
          mediaType: "movie",
          id: data.id,
          name: data.title,
          originalName: data.original_title,
          overview: data.overview || "",
          posterPath: data.poster_path,
          backdropPath: data.backdrop_path,
          releaseDate: data.release_date || null,
          runtime: data.runtime || null,
          voteAverage: data.vote_average || 0,
          voteCount: data.vote_count || 0,
          popularity: data.popularity || 0,
          status: data.status || null,
          tagline: data.tagline || null,
          originalLanguage: data.original_language || null,
          genres: (data.genres || []).map((g: any) => g.name),
          budget: data.budget || 0,
          revenue: data.revenue || 0,
          homepage: data.homepage || null,
          imdbId: data.imdb_id || null,
          productionCompanies: (data.production_companies || []).map(
            (c: any) => c.name,
          ),
          cast,
          crew,
          trailers,
        });
      } catch (error) {
        console.error("TMDB movie details error:", error);
        return NextResponse.json(
          { error: "Failed to fetch movie details" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 40, windowMs: 60 * 1000 },
  );
}
