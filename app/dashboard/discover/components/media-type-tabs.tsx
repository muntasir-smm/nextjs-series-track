// app/dashboard/discover/components/media-type-tabs.tsx

"use client";

import clsx from "clsx";
import { SparklesIcon, FilmIcon, TvIcon } from "@heroicons/react/24/outline";
import type { MediaTypeFilter } from "../utils";

const TABS = [
  { id: "all" as const, label: "All", icon: SparklesIcon },
  { id: "tv" as const, label: "TV", icon: TvIcon },
  { id: "movie" as const, label: "Movies", icon: FilmIcon },
];

export function MediaTypeTabs({
  value,
  onChange,
}: {
  value: MediaTypeFilter;
  onChange: (v: MediaTypeFilter) => void;
}) {
  return (
    <div className="inline-flex self-start rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
            value === id
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
