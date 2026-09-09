// app/api/public/popular/route.ts

import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const revalidate = 3600;

async function enrichTvSeasons(items: { id: string; totalSeasons?: number }[]) {
  if (!TMDB_API_KEY) return items;

  const enriched = await Promise.all(
    items.map(async (item) => {
      try {
        const res = await fetch(
          `${BASE_URL}/tv/${item.id}?api_key=${TMDB_API_KEY}&language=en-US`,
          { next: { revalidate: 3600 } },
        );
        if (!res.ok) return item;
        const d = await res.json();
        return {
          ...item,
          totalSeasons: d.number_of_seasons ?? 0,
          status: d.status || null,
        };
      } catch {
        return item;
      }
    }),
  );
  return enriched;
}

export async function GET() {
  if (!TMDB_API_KEY) {
    return NextResponse.json({ series: [], movies: [] }, { status: 500 });
  }

  try {
    const [tvRes, movieRes] = await Promise.all([
      fetch(
        `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
        { next: { revalidate: 3600 } },
      ),
      fetch(
        `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
        { next: { revalidate: 3600 } },
      ),
    ]);

    if (!tvRes.ok || !movieRes.ok) {
      throw new Error("TMDB popular fetch failed");
    }

    const tvData = await tvRes.json();
    const movieData = await movieRes.json();

    let series = (tvData.results || []).slice(0, 12).map((show: any) => ({
      id: String(show.id),
      tmdbId: show.id,
      mediaType: "tv" as const,
      name: show.name,
      posterPath: show.poster_path,
      voteAverage: show.vote_average ?? 0,
      firstAirDate: show.first_air_date || null,
      overview: show.overview || null,
      popularity: show.popularity ?? 0,
      totalSeasons: 0,
    }));

    // Real season counts (list endpoint does not include them)
    series = await enrichTvSeasons(series);

    const movies = (movieData.results || []).slice(0, 12).map((m: any) => ({
      id: String(m.id),
      tmdbId: m.id,
      mediaType: "movie" as const,
      name: m.title,
      posterPath: m.poster_path,
      voteAverage: m.vote_average ?? 0,
      releaseDate: m.release_date || null,
      overview: m.overview || null,
      popularity: m.popularity ?? 0,
      runtime: null as number | null,
    }));

    return NextResponse.json({ series, movies });
  } catch (error) {
    console.error("Error fetching popular:", error);
    return NextResponse.json({ series: [], movies: [] }, { status: 500 });
  }
}
