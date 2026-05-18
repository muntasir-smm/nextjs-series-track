// app/admin/components/UserTable.tsx

"use client";

import { useState } from "react";
import {
  UserIcon,
  EyeIcon,
  KeyIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  XMarkIcon,
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
  ban_reason?: string;
}

interface UserTableProps {
  users: User[];
  onUpdateUser: (
    userId: string,
    action: string,
    data?: any,
  ) => Promise<{ success: boolean; message?: string }>;
  onRefresh: () => void;
}

export default function UserTable({
  users = [],
  onUpdateUser,
  onRefresh,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [banReason, setBanReason] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Reset Password Action
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    if (newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }
    setLoadingAction("reset");
    try {
      const result = await onUpdateUser(selectedUser.id, "resetPassword", {
        newPassword,
      });
      if (result.success) {
        showMessage("success", `Password reset for ${selectedUser.name}`);
        setNewPassword("");
      } else {
        showMessage("error", result.message || "Failed to reset password");
      }
    } catch (error) {
      showMessage("error", "Failed to reset password");
    } finally {
      setLoadingAction(null);
    }
  };

  // Ban User Action
  const handleBanUser = async () => {
    if (!selectedUser) return;
    setLoadingAction("ban");
    try {
      const result = await onUpdateUser(selectedUser.id, "ban", {
        reason: banReason || "No reason provided",
      });
      if (result.success) {
        showMessage("success", `${selectedUser.name} has been banned`);
        await onRefresh();
        setShowBanModal(false);
        setBanReason("");
        setSelectedUser(null);
      } else {
        showMessage("error", result.message || "Failed to ban user");
      }
    } catch (error) {
      showMessage("error", "Failed to ban user");
    } finally {
      setLoadingAction(null);
    }
  };

  // Unban User Action
  const handleUnbanUser = async (userId: string, userName: string) => {
    setLoadingAction("unban");
    try {
      const result = await onUpdateUser(userId, "unban");
      if (result.success) {
        showMessage("success", `${userName} has been unbanned`);
        await onRefresh();
      } else {
        showMessage("error", result.message || "Failed to unban user");
      }
    } catch (error) {
      showMessage("error", "Failed to unban user");
    } finally {
      setLoadingAction(null);
    }
  };

  // Toggle Active Status Action
  const handleToggleActive = async (
    userId: string,
    userName: string,
    currentStatus: boolean,
  ) => {
    setLoadingAction("toggle");
    try {
      const result = await onUpdateUser(userId, "toggleActive", {
        isActive: !currentStatus,
      });
      if (result.success) {
        showMessage(
          "success",
          `${userName} ${!currentStatus ? "activated" : "deactivated"}`,
        );
        await onRefresh();
      } else {
        showMessage("error", result.message || "Failed to update user status");
      }
    } catch (error) {
      showMessage("error", "Failed to update user status");
    } finally {
      setLoadingAction(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-700">
          <UserIcon className="h-8 w-8 text-gray-400" />
        </div>
        <p className="mt-3 text-gray-500 dark:text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message Toast */}
      {message && (
        <div
          className={`rounded-lg p-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Summary */}
      <div className="flex flex-wrap gap-4 pb-2">
        <div className="rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Total: {users.length}
        </div>
        <div className="rounded-lg bg-green-50 px-3 py-1 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Active: {users.filter((u) => u.is_active && !u.is_banned).length}
        </div>
        <div className="rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Banned: {users.filter((u) => u.is_banned).length}
        </div>
        <div className="rounded-lg bg-purple-50 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          Admins: {users.filter((u) => u.role === "admin").length}
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50">
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
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
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
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/30 dark:to-purple-900/20 dark:text-purple-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <ShieldCheckIcon className="h-3 w-3" />
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {user.last_login ? formatDate(user.last_login) : "Never"}
                </td>
                <td className="px-4 py-3 text-center">
                  {user.is_banned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <NoSymbolIcon className="h-3 w-3" />
                      Banned
                    </span>
                  ) : user.is_active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircleIcon className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                      <XMarkIcon className="h-3 w-3" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetailsModal(true);
                      }}
                      className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-blue-600"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowResetPasswordModal(true);
                      }}
                      disabled={loadingAction !== null}
                      className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
                      title="Reset Password"
                    >
                      <KeyIcon className="h-4 w-4" />
                    </button>

                    {user.is_banned ? (
                      <button
                        onClick={() => handleUnbanUser(user.id, user.name)}
                        disabled={loadingAction !== null}
                        className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                        title="Unban User"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBanModal(true);
                        }}
                        disabled={loadingAction !== null}
                        className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Ban User"
                      >
                        <NoSymbolIcon className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleToggleActive(user.id, user.name, user.is_active)
                      }
                      disabled={loadingAction !== null}
                      className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
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
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedUser(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <span className="text-2xl font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    User ID:
                  </span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {selectedUser.id}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Role:
                  </span>
                  <span
                    className={`font-medium ${
                      selectedUser.role === "admin"
                        ? "text-purple-600"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Member Since:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(selectedUser.created_at)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Login:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedUser.last_login
                      ? formatDate(selectedUser.last_login)
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <span
                    className={`font-medium ${
                      selectedUser.is_banned
                        ? "text-red-600"
                        : selectedUser.is_active
                          ? "text-green-600"
                          : "text-gray-500"
                    }`}
                  >
                    {selectedUser.is_banned
                      ? "Banned"
                      : selectedUser.is_active
                        ? "Active"
                        : "Inactive"}
                  </span>
                </div>
                {selectedUser.ban_reason && (
                  <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Ban Reason:
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      {selectedUser.ban_reason}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowResetPasswordModal(true);
                  }}
                  className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white transition-all hover:bg-amber-600"
                >
                  Reset Password
                </button>
                {!selectedUser.is_banned && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowBanModal(true);
                    }}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white transition-all hover:bg-red-600"
                  >
                    Ban User
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => {
                setShowResetPasswordModal(false);
                setSelectedUser(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="p-6">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <KeyIcon className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  For {selectedUser.name}
                </p>
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleResetPassword}
                  disabled={!newPassword || loadingAction !== null}
                  className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white transition-all hover:bg-amber-600 disabled:opacity-50"
                >
                  {loadingAction === "reset"
                    ? "Resetting..."
                    : "Reset Password"}
                </button>
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => {
                setShowBanModal(false);
                setSelectedUser(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="p-6">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <NoSymbolIcon className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ban User
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedUser.name}
                </p>
              </div>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for ban (optional)"
                rows={3}
                className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleBanUser}
                  disabled={loadingAction !== null}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {loadingAction === "ban" ? "Banning..." : "Ban User"}
                </button>
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
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
