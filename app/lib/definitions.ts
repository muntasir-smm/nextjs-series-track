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
