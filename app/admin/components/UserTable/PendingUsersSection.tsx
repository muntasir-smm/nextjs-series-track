// app/admin/components/UserTable/PendingUsersSection.tsx

"use client";

import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Avatar from "@/app/ui/dashboard/avatar";
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
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
          <ClockIcon className="h-3.5 w-3.5 text-white" />
        </div>
        Pending Approvals ({users.length})
      </h2>

      <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20">
        <table className="w-full">
          <thead>
            <tr className="border-b border-amber-200 dark:border-amber-900/50">
              {["User", "Email", "Joined", "Actions"].map((header) => (
                <th
                  key={header}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                    header === "Actions" ? "text-center" : "text-left"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100 dark:divide-amber-900/40">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-amber-100/40 dark:hover:bg-amber-900/10"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatar_url}
                      name={user.name}
                      size="sm"
                      shape="circle"
                    />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onApprove(user.id, user.name)}
                      disabled={loadingAction !== null}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(user.id, user.name)}
                      disabled={loadingAction !== null}
                      className="inline-flex items-center gap-1 rounded-xl bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
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
