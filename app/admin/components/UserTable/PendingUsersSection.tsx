// app/admin/components/UserTable/PendingUsersSection.tsx

"use client";

import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { User } from "./types";

interface PendingUsersSectionProps {
  users: User[];
  onApprove: (userId: string, userName: string) => void;
  onReject: (userId: string, userName: string) => void;
  loadingAction: string | null;
}

export function PendingUsersSection({
  users,
  onApprove,
  onReject,
  loadingAction,
}: PendingUsersSectionProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
          <ClockIcon className="h-3.5 w-3.5 text-white" />
        </div>
        Pending Approvals ({users.length})
      </h2>
      <div className="overflow-x-auto rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 dark:border-yellow-800 dark:from-yellow-900/10 dark:to-orange-900/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-yellow-200 dark:border-yellow-800">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Joined
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-100 dark:divide-yellow-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-yellow-100/30 dark:hover:bg-yellow-900/10"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-sm">
                      <span className="text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onApprove(user.id, user.name)}
                      disabled={loadingAction !== null}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-green-600 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(user.id, user.name)}
                      disabled={loadingAction !== null}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
