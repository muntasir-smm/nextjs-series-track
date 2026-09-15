// app/dashboard/discover/utils.ts

export type MediaTypeFilter = "all" | "tv" | "movie";
export type ItemMediaType = "tv" | "movie";

export interface DiscoverItem {
  id: string;
  tmdbId: number;
  mediaType: ItemMediaType;
  name: string;
  overview?: string;
  posterPath?: string | null;
  voteAverage?: number;
  firstAirDate?: string | null;
  releaseDate?: string | null;
}

export interface RawTmdbItem {
  id?: number | string;
  tmdbId?: number;
  media_type?: string;
  mediaType?: string;
  name?: string;
  title?: string;
  overview?: string;
  poster_path?: string | null;
  posterPath?: string | null;
  vote_average?: number;
  voteAverage?: number;
  first_air_date?: string | null;
  firstAirDate?: string | null;
  release_date?: string | null;
  releaseDate?: string | null;
}

export interface TmdbListResponse {
  results?: RawTmdbItem[];
  series?: RawTmdbItem[];
  movies?: RawTmdbItem[];
  totalPages?: number;
  total_pages?: number;
}

export function normalizeResults(
  data: TmdbListResponse,
  fallbackType: MediaTypeFilter,
): DiscoverItem[] {
  const raw =
    data.results ||
    data.series ||
    data.movies ||
    (Array.isArray(data) ? data : []);

  const out: DiscoverItem[] = [];
  for (const item of raw) {
    const rawType = item.mediaType || item.media_type || fallbackType;
    if (rawType !== "movie" && rawType !== "tv") continue;
    const tmdbId = Number(item.tmdbId ?? item.id);
    if (!Number.isFinite(tmdbId) || tmdbId <= 0) continue;
    out.push({
      id: String(tmdbId),
      tmdbId,
      mediaType: rawType,
      name: item.name || item.title || "Untitled",
      overview: item.overview || "",
      posterPath: item.posterPath ?? item.poster_path ?? null,
      voteAverage: Number(item.voteAverage ?? item.vote_average ?? 0),
      firstAirDate: item.firstAirDate ?? item.first_air_date ?? null,
      releaseDate: item.releaseDate ?? item.release_date ?? null,
    });
  }
  return out;
}

export function buildUrl(
  query: string,
  page: number,
  type: MediaTypeFilter,
): string {
  if (query.trim()) {
    const searchType =
      type === "all" ? "multi" : type === "movie" ? "movie" : "tv";
    return `/api/tmdb/search?query=${encodeURIComponent(query)}&page=${page}&type=${searchType}`;
  }
  return `/api/tmdb/popular?type=${type}&page=${page}&limit=24`;
}

export function posterUrl(path: string | null | undefined, size = "w342") {
  if (!path) return null;
  return path.startsWith("http")
    ? path
    : `https://image.tmdb.org/t/p/${size}${path}`;
}
