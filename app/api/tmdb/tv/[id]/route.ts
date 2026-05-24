// app/api/tmdb/tv/[id]/route.ts

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  try {
    // Fetch TV series details
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,similar,recommendations`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch TV series" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Extract and format the data
    const series = {
      id: data.id.toString(),
      name: data.name,
      originalName: data.original_name,
      overview: data.overview,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      firstAirDate: data.first_air_date,
      lastAirDate: data.last_air_date,
      status: data.status,
      tagline: data.tagline,
      genres: data.genres?.map((g: any) => g.name) || [],
      totalSeasons: data.number_of_seasons,
      totalEpisodes: data.number_of_episodes,
      originalLanguage: data.original_language,
      popularity: data.popularity,
      inProduction: data.in_production,
      networks: data.networks?.map((n: any) => n.name) || [],
      seasons:
        data.seasons?.map((season: any) => ({
          seasonNumber: season.season_number,
          episodeCount: season.episode_count,
          airDate: season.air_date,
          overview: season.overview,
          posterPath: season.poster_path,
        })) || [],
      credits: {
        cast:
          data.credits?.cast?.slice(0, 10).map((person: any) => ({
            id: person.id,
            name: person.name,
            character: person.character,
            profilePath: person.profile_path,
          })) || [],
        crew:
          data.credits?.crew?.slice(0, 5).map((person: any) => ({
            id: person.id,
            name: person.name,
            job: person.job,
            department: person.department,
          })) || [],
      },
    };

    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching TV series:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
