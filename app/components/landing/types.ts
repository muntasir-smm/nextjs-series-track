// app/components/landing/types.ts

export interface PopularItem {
  id: string;
  tmdbId?: number;
  mediaType?: "tv" | "movie";
  name: string;
  posterPath: string | null;
  voteAverage: number;
  firstAirDate?: string | null;
  releaseDate?: string | null;
  overview?: string | null;
  totalSeasons?: number;
}

export interface FeaturedSeries {
  id: string;
  seriesId: string;
  name: string;
  posterPath: string | null;
  reason: string;
  tmdbId?: number | null;
}
