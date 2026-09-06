// app/dashboard/tvSeries/[id]/components/series-synopsis.tsx

"use client";

import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export function SeriesSynopsis({ overview }: { overview?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const text = overview || "No overview available.";
  const long = text.length > 400;
  const display = expanded || !long ? text : `${text.substring(0, 400)}...`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-brand-100 p-2 dark:bg-brand-950/40">
          <InformationCircleIcon className="h-5 w-5 text-brand-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Synopsis
        </h2>
      </div>
      <p className="leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
        {display}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm font-medium text-brand-600 hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
