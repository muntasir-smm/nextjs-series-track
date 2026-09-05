// app/admin/components/UserTable/EmptyState.tsx

"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import type { FilterType } from "./types";

interface EmptyStateProps {
  activeFilter: FilterType;
}

export function EmptyState({ activeFilter }: EmptyStateProps) {
  const messages: Record<FilterType, string> = {
    pending: "No pending approvals",
    active: "No active users",
    banned: "No banned users",
    admins: "No admin users",
    all: "No users found",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <SparklesIcon className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        {messages[activeFilter]}
      </p>
    </div>
  );
}
