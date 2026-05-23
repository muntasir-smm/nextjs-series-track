// app/dashboard/(overview)/components/empty-state.tsx

"use client";

import { TvIcon, PlusIcon } from "@heroicons/react/24/outline";

export const EmptyState: React.FC = () => (
  <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 p-12 text-center dark:from-purple-900/20 dark:to-blue-900/20">
    <TvIcon className="mx-auto h-16 w-16 text-gray-400" />
    <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
      Your watchlist is empty
    </h3>
    <p className="mt-2 text-gray-500 dark:text-gray-400">
      Start tracking your favorite TV series today!
    </p>
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("open-add-modal"))}
      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
    >
      <PlusIcon className="h-5 w-5" />
      Add Your First Series
    </button>
  </div>
);
