// app/admin/components/UserTable/ApprovedUsersTable.tsx

"use client";

import {
  EyeIcon,
  KeyIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Avatar from "@/app/ui/dashboard/avatar";
import type { User, FilterType } from "./types";
import clsx from "clsx";

interface ApprovedUsersTableProps {
  users: User[];
  activeFilter: FilterType;
  onViewDetails: (user: User) => void;
  onResetPassword: (user: User) => void;
  onBan: (user: User) => void;
  onUnban: (userId: string, userName: string) => void;
  onMakeAdmin: (userId: string, userName: string) => void;
  onRemoveAdmin: (userId: string, userName: string) => void;
  loadingAction: string | null;
}

export function ApprovedUsersTable({
  users,
  activeFilter,
  onViewDetails,
  onResetPassword,
  onBan,
  onUnban,
  onMakeAdmin,
  onRemoveAdmin,
  loadingAction,
}: ApprovedUsersTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getHeaderTitle = () => {
    switch (activeFilter) {
      case "active":
        return "Active Users";
      case "banned":
        return "Banned Users";
      case "admins":
        return "Administrators";
      default:
        return "All Users";
    }
  };

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
        {getHeaderTitle()} ({users.length})
      </h2>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {[
                "User",
                "Email",
                "Role",
                "Joined",
                "Last Login",
                "Status",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className={clsx(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
                    header === "Status" || header === "Actions"
                      ? "text-center"
                      : "text-left",
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                {/* User + Avatar */}
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

                {/* Role */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                        user.role === "admin"
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                      )}
                    >
                      <ShieldCheckIcon className="h-3 w-3" />
                      {user.role}
                    </span>

                    {user.role !== "admin" && (
                      <button
                        onClick={() => onMakeAdmin(user.id, user.name)}
                        className="rounded-lg p-1 text-violet-600 transition hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/30"
                        title="Make Admin"
                      >
                        <ShieldCheckIcon className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {user.role === "admin" && (
                      <button
                        onClick={() => onRemoveAdmin(user.id, user.name)}
                        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        title="Remove Admin"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(user.created_at)}
                </td>

                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {user.last_login ? formatDate(user.last_login) : "Never"}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  {user.is_banned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
                      <NoSymbolIcon className="h-3 w-3" />
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircleIcon className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onViewDetails(user)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onResetPassword(user)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30"
                      title="Reset Password"
                    >
                      <KeyIcon className="h-4 w-4" />
                    </button>
                    {user.is_banned ? (
                      <button
                        onClick={() => onUnban(user.id, user.name)}
                        disabled={loadingAction !== null}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 dark:hover:bg-emerald-950/30"
                        title="Unban User"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onBan(user)}
                        disabled={loadingAction !== null}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                        title="Ban User"
                      >
                        <NoSymbolIcon className="h-4 w-4" />
                      </button>
                    )}
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
