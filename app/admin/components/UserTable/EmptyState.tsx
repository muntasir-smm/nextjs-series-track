// app/admin/components/UserTable/EmptyState.tsx

"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import type { FilterType } from "./types";

interface EmptyStateProps {
  activeFilter: FilterType;
}

export function EmptyState({ activeFilter }: EmptyStateProps) {
  const messages = {
    pending: "✨ No pending approvals",
    active: "👥 No active users",
    banned: "🚫 No banned users",
    admins: "👑 No admin users",
    all: "📭 No users found",
  };

  return (
    <div className="text-center py-12">
      <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-700">
        <SparklesIcon className="h-8 w-8 text-gray-400" />
      </div>
      <p className="mt-3 text-gray-500 dark:text-gray-400">
        {messages[activeFilter]}
      </p>
    </div>
  );
}
