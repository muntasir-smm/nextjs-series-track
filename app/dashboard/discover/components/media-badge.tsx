// app/dashboard/discover/components/media-badge.tsx

import clsx from "clsx";
import type { ItemMediaType } from "../utils";

export function MediaBadge({ mediaType }: { mediaType: ItemMediaType }) {
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center rounded-lg px-1.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur",
        mediaType === "movie"
          ? "bg-violet-500/90 text-white"
          : "bg-sky-500/90 text-white",
      )}
    >
      {mediaType === "movie" ? "Movie" : "TV"}
    </span>
  );
}
