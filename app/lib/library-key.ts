// app/lib/library-key.ts

export function libraryKey(mediaType: string, tmdbId: number | string): string {
  const type = mediaType === "movie" ? "movie" : "tv";
  return `${type}:${Number(tmdbId)}`;
}
