// app/dashboard/(overview)/components/empty-state.tsx

"use client";

import { TvIcon, PlusIcon } from "@heroicons/react/24/outline";

export const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/40">
      <TvIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
    </div>
    <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
      Your watchlist is empty
    </h3>
    <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
      Start tracking your favorite TV series and never lose track of what
      you&apos;re watching.
    </p>
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("open-add-modal"))}
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
    >
      <PlusIcon className="h-4 w-4" />
      Add Your First Series
    </button>
  </div>
);
