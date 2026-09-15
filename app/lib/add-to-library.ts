// app/lib/add-to-library.ts

import {
  addSeries as addSeriesAction,
  addMovie as addMovieAction,
} from "@/app/lib/series";

export interface AddToLibraryResult {
  success: boolean;
  duplicate?: boolean;
  name?: string;
  seriesId?: string;
  error?: string;
}

export async function addToLibrary(
  mediaType: "tv" | "movie",
  tmdbId: number,
): Promise<AddToLibraryResult> {
  try {
    if (mediaType === "movie") {
      const res = await fetch(`/api/tmdb/movie/${tmdbId}`);
      if (!res.ok)
        return { success: false, error: "Failed to load movie details" };
      const d = await res.json();
      const name = d.name || d.title;
      const result = await addMovieAction({
        tmdbId: d.id,
        name,
        overview: d.overview,
        posterPath: d.posterPath,
        backdropPath: d.backdropPath,
        voteAverage: d.voteAverage,
        voteCount: d.voteCount,
        releaseDate: d.releaseDate,
        runtime: d.runtime,
        genres: d.genres,
        status: d.status,
        tagline: d.tagline,
        originalName: d.originalName,
        originalLanguage: d.originalLanguage,
        popularity: d.popularity,
      });
      return {
        success: !!result.success,
        duplicate: result.duplicate,
        name,
        seriesId: result.seriesId,
        error: result.error,
      };
    }

    const res = await fetch(`/api/tmdb/tv/${tmdbId}`);
    if (!res.ok) return { success: false, error: "Failed to load TV details" };
    const d = await res.json();
    const name = d.name;
    const result = await addSeriesAction(
      d.id,
      d.name,
      d.totalSeasons || 0,
      [],
      d.posterPath,
      d.backdropPath,
      d.overview,
      d.voteAverage,
      d.voteCount,
      d.firstAirDate,
      d.lastAirDate,
      d.genres,
      d.status,
      d.tagline,
      d.originalName,
      d.originalLanguage,
      d.popularity,
      d.inProduction,
      d.networks,
      d.totalEpisodes,
      d.seasons,
    );
    return {
      success: !!result.success,
      duplicate: result.duplicate,
      name,
      seriesId: result.seriesId,
      error: result.error,
    };
  } catch (err) {
    console.error("addToLibrary error:", err);
    return { success: false, error: "Network error. Please try again." };
  }
}
