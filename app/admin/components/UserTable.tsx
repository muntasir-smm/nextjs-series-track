// app/admin/components/UserTable.tsx

"use client";

import { useState } from "react";
import {
  UserIcon,
  EyeIcon,
  KeyIcon,
  NoSymbolIcon, // Instead of BanIcon
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string;
  is_banned: boolean;
  is_active: boolean;
}

interface UserTableProps {
  users: User[];
  onUpdateUser: (userId: string, action: string, data?: any) => Promise<void>;
}

export default function UserTable({
  users = [],
  onUpdateUser,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [banReason, setBanReason] = useState("");

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    await onUpdateUser(selectedUser.id, "resetPassword", { newPassword });
    setShowResetPassword(false);
    setNewPassword("");
    setSelectedUser(null);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    await onUpdateUser(selectedUser.id, "ban", {
      reason: banReason || "No reason provided",
    });
    setBanReason("");
    setSelectedUser(null);
  };

  const handleUnbanUser = async (userId: string) => {
    await onUpdateUser(userId, "unban");
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    await onUpdateUser(userId, "toggleActive", { isActive: !currentStatus });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              User
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Email
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Role
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Joined
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Last Login
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
              Status
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                {user.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(user.created_at)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(user.last_login)}
              </td>
              <td className="px-4 py-3 text-center">
                {user.is_banned ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Banned
                  </span>
                ) : user.is_active ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-blue-600"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowResetPassword(true);
                    }}
                    className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-amber-600"
                    title="Reset Password"
                  >
                    <KeyIcon className="h-4 w-4" />
                  </button>

                  {user.is_banned ? (
                    <button
                      onClick={() => handleUnbanUser(user.id)}
                      className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-green-600"
                      title="Unban User"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setBanReason("");
                      }}
                      className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-red-600"
                      title="Ban User"
                    >
                      <NoSymbolIcon className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-blue-600"
                    title={user.is_active ? "Deactivate" : "Activate"}
                  >
                    <UserIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Reset Password Modal */}
      {showResetPassword && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => setShowResetPassword(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Reset Password for {selectedUser.name}
              </h2>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleResetPassword}
                  disabled={!newPassword}
                  className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => setShowResetPassword(false)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {banReason !== undefined && selectedUser && !showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Ban User: {selectedUser.name}
              </h2>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for ban (optional)"
                className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleBanUser}
                  className="flex-1 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Ban User
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
