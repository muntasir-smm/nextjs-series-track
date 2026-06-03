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
import type { User, FilterType } from "./types";

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
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        {getHeaderTitle()} ({users.length})
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Last Login
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm">
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/30 dark:to-purple-900/20 dark:text-purple-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <ShieldCheckIcon className="h-3 w-3" />
                      {user.role}
                    </span>
                    {user.role !== "admin" && (
                      <button
                        onClick={() => onMakeAdmin(user.id, user.name)}
                        className="rounded p-1 text-xs text-purple-600 transition-all hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                        title="Make Admin"
                      >
                        <ShieldCheckIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {user.role === "admin" && (
                      <button
                        onClick={() => onRemoveAdmin(user.id, user.name)}
                        className="rounded p-1 text-xs text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Remove Admin"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {user.last_login ? formatDate(user.last_login) : "Never"}
                </td>
                <td className="px-4 py-3 text-center">
                  {user.is_banned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <NoSymbolIcon className="h-3 w-3" />
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircleIcon className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onViewDetails(user)}
                      className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onResetPassword(user)}
                      className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20"
                      title="Reset Password"
                    >
                      <KeyIcon className="h-4 w-4" />
                    </button>
                    {user.is_banned ? (
                      <button
                        onClick={() => onUnban(user.id, user.name)}
                        disabled={loadingAction !== null}
                        className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 disabled:opacity-50"
                        title="Unban User"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onBan(user)}
                        disabled={loadingAction !== null}
                        className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 disabled:opacity-50"
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
