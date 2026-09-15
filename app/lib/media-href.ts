// app/lib/media-href.ts

export function mediaDetailHref(
  mediaType: "tv" | "movie",
  tmdbId: number,
  librarySeriesId?: string | null,
) {
  if (librarySeriesId) {
    return mediaType === "movie"
      ? `/dashboard/movie/${librarySeriesId}`
      : `/dashboard/tvSeries/${librarySeriesId}`;
  }
  return `/explore/${mediaType}/${tmdbId}`;
}
