// app/lib/definitions.ts

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type SuggestedSeries = {
  id: string;
  tmdbId: number;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchProgress: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string | null;
  voteAverage?: number;
};

export type MediaType = "movie" | "tv";

export interface SeasonSummary {
  seasonNumber: number;
  name?: string;
  episodeCount: number;
  airDate?: string | null;
  overview?: string | null;
  posterPath?: string | null;
}

export type WatchedEpisodesMap = Record<string, number[]>;

export interface UserMedia {
  id: string;
  mediaType: MediaType;
  tmdbId: number;
  name: string;
  originalName?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number | null;
  voteCount?: number | null;
  popularity?: number | null;
  genres?: string[];
  status?: string | null;
  tagline?: string | null;
  originalLanguage?: string | null;
  runtime?: number | null;
  releaseDate?: string | null;
  watched?: boolean;
  watchedAt?: string | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  totalSeasons?: number;
  totalEpisodes?: number;
  inProduction?: boolean | null;
  networks?: string[];
  seasons?: SeasonSummary[];
  upcomingSeasons?: string[];
  watchedSeasons?: boolean[];
  watchedEpisodes?: WatchedEpisodesMap;
  watchProgress: number;
}

export type Series = UserMedia;
