// app/api/tmdb/tv/[id]/season/[seasonNumber]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/app/lib/rate-limit";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string; seasonNumber: string }>;
  },
) {
  return withRateLimit(
    request,
    async () => {
      const { id, seasonNumber } = await context.params;
      const season = parseInt(seasonNumber, 10);

      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { error: "API not configured" },
          { status: 500 },
        );
      }

      if (!id || Number.isNaN(Number(id)) || Number.isNaN(season)) {
        return NextResponse.json({ error: "Invalid params" }, { status: 400 });
      }

      try {
        const response = await fetch(
          `${BASE_URL}/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}&language=en-US`,
          { next: { revalidate: 86400 } },
        );

        if (!response.ok) {
          if (response.status === 404) {
            return NextResponse.json(
              { error: "Season not found" },
              { status: 404 },
            );
          }
          throw new Error(`TMDB error: ${response.status}`);
        }

        const data = await response.json();

        const episodes = (data.episodes || []).map((ep: any) => ({
          id: ep.id,
          name: ep.name,
          overview: ep.overview || "",
          episodeNumber: ep.episode_number,
          seasonNumber: ep.season_number,
          airDate: ep.air_date || null,
          runtime: ep.runtime || null,
          stillPath: ep.still_path || null,
          voteAverage: ep.vote_average || 0,
        }));

        return NextResponse.json({
          id: data.id,
          name: data.name,
          overview: data.overview || "",
          seasonNumber: data.season_number,
          airDate: data.air_date || null,
          posterPath: data.poster_path || null,
          episodes,
        });
      } catch (error) {
        console.error("TMDB season details error:", error);
        return NextResponse.json(
          { error: "Failed to fetch season" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 40, windowMs: 60 * 1000 },
  );
}
