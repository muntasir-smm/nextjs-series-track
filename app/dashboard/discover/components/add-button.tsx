// app/dashboard/discover/components/add-button.tsx

"use client";

import clsx from "clsx";
import {
  ArrowPathIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export function AddButton({
  isAdding,
  isInLibrary,
  onAdd,
}: {
  isAdding: boolean;
  isInLibrary: boolean;
  onAdd: () => void;
}) {
  if (isInLibrary) {
    return (
      <button
        type="button"
        disabled
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-50 py-1.5 text-xs font-medium  dark:bg-emerald-950/40 dark:text-emerald-400 bg-emerald-600/95 text-white"
      >
        <CheckIcon className="h-3.5 w-3.5" />
        In library
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isAdding}
      onClick={onAdd}
      aria-label="Add to library"
      className={clsx(
        "mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition",
        "bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
      )}
    >
      {isAdding ? (
        <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <PlusIcon className="h-3.5 w-3.5" />
      )}
      Add
    </button>
  );
}
