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
  ClockIcon,
  UserPlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
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
  is_approved?: boolean;
  approved_at?: string;
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

type FilterType = "all" | "pending" | "active" | "banned" | "admins";

export default function UserTable({
  users = [],
  onUpdateUser,
  onRefresh,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Approve User Action
  const handleApproveUser = async (userId: string, userName: string) => {
    setLoadingAction("approve");
    try {
      const result = await onUpdateUser(userId, "approve");
      if (result.success) {
        showMessage("success", `${userName} has been approved`);
        await onRefresh();
      } else {
        showMessage("error", result.message || "Failed to approve user");
      }
    } catch (error) {
      showMessage("error", "Failed to approve user");
    } finally {
      setLoadingAction(null);
    }
  };

  // Reject User Action
  const handleRejectUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to reject and delete ${userName}? This action cannot be undone.`,
      )
    ) {
      return;
    }
    setLoadingAction("reject");
    try {
      const result = await onUpdateUser(userId, "reject");
      if (result.success) {
        showMessage("success", `${userName} has been rejected and removed`);
        await onRefresh();
      } else {
        showMessage("error", result.message || "Failed to reject user");
      }
    } catch (error) {
      showMessage("error", "Failed to reject user");
    } finally {
      setLoadingAction(null);
    }
  };

  // Make Admin Action
  const handleMakeAdmin = async (userId: string, userName: string) => {
    setLoadingAction("makeAdmin");
    try {
      const result = await onUpdateUser(userId, "makeAdmin");
      if (result.success) {
        showMessage("success", `${userName} is now an admin`);
        await onRefresh();
      } else {
        showMessage("error", result.message || "Failed to make admin");
      }
    } catch (error) {
      showMessage("error", "Failed to make admin");
    } finally {
      setLoadingAction(null);
    }
  };

  // Remove Admin Action
  const handleRemoveAdmin = async (userId: string, userName: string) => {
    setLoadingAction("removeAdmin");
    try {
      const result = await onUpdateUser(userId, "removeAdmin");
      if (result.success) {
        showMessage("success", `Admin privileges removed from ${userName}`);
        await onRefresh();
      } else {
        showMessage("error", result.message || "Failed to remove admin");
      }
    } catch (error) {
      showMessage("error", "Failed to remove admin");
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  // Calculate stats
  const stats = {
    total: users.length,
    pending: users.filter((u) => !u.is_approved).length,
    active: users.filter((u) => u.is_approved && !u.is_banned && u.is_active)
      .length,
    banned: users.filter((u) => u.is_banned).length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  // Filter users based on active filter
  const getFilteredUsers = () => {
    switch (activeFilter) {
      case "pending":
        return users.filter((u) => !u.is_approved);
      case "active":
        return users.filter(
          (u) => u.is_approved && !u.is_banned && u.is_active,
        );
      case "banned":
        return users.filter((u) => u.is_banned);
      case "admins":
        return users.filter((u) => u.role === "admin");
      default:
        return users;
    }
  };

  const filteredUsers = getFilteredUsers();
  const pendingUsers = filteredUsers.filter((u) => !u.is_approved);
  const approvedUsers = filteredUsers.filter((u) => u.is_approved);

  const StatCard = ({
    label,
    value,
    filter,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number;
    filter: FilterType;
    icon: any;
    color: string;
  }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`flex-1 min-w-[100px] rounded-xl p-3 text-left transition-all ${
        activeFilter === filter
          ? `${color} shadow-md ring-2 ring-offset-2 ring-${color.split("-")[1]}-500`
          : "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${activeFilter === filter ? "text-white" : "text-gray-400"}`}
        />
        <span
          className={`text-xs font-medium ${activeFilter === filter ? "text-white/80" : "text-gray-500"}`}
        >
          {label}
        </span>
      </div>
      <p
        className={`text-xl font-bold ${activeFilter === filter ? "text-white" : "text-gray-900 dark:text-white"}`}
      >
        {value}
      </p>
    </button>
  );

  return (
    <div className="space-y-6">
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

      {/* Stats Cards - Clickable Filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total"
          value={stats.total}
          filter="all"
          icon={UserIcon}
          color="bg-gray-500"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          filter="pending"
          icon={ClockIcon}
          color="bg-yellow-500"
        />
        <StatCard
          label="Active"
          value={stats.active}
          filter="active"
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <StatCard
          label="Banned"
          value={stats.banned}
          filter="banned"
          icon={NoSymbolIcon}
          color="bg-red-500"
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          filter="admins"
          icon={ShieldCheckIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Pending Approvals Section */}
      {pendingUsers.length > 0 && activeFilter === "pending" && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <ClockIcon className="h-5 w-5 text-yellow-500" />
            Pending Approvals ({pendingUsers.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-900/10">
            <table className="w-full">
              <thead className="bg-yellow-100 dark:bg-yellow-900/30">
                <tr>
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
                {pendingUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
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
                          onClick={() => handleApproveUser(user.id, user.name)}
                          disabled={loadingAction !== null}
                          className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-green-600 disabled:opacity-50"
                        >
                          {loadingAction === "approve" ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id, user.name)}
                          disabled={loadingAction !== null}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
                        >
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
      )}

      {/* Approved Users Section */}
      {approvedUsers.length > 0 && activeFilter !== "pending" && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {activeFilter === "all" && "All Users"}
            {activeFilter === "active" && "Active Users"}
            {activeFilter === "banned" && "Banned Users"}
            {activeFilter === "admins" && "Administrators"}
            {activeFilter === "all" && ` (${approvedUsers.length})`}
          </h2>
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
                {approvedUsers.map((user) => (
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
                      <div className="flex items-center gap-1">
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
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleMakeAdmin(user.id, user.name)}
                            className="rounded px-1 py-0.5 text-xs text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                            title="Make Admin"
                          >
                            <ShieldCheckIcon className="h-3 w-3" />
                          </button>
                        )}
                        {user.role === "admin" && (
                          <button
                            onClick={() =>
                              handleRemoveAdmin(user.id, user.name)
                            }
                            className="rounded px-1 py-0.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Remove Admin"
                          >
                            <XMarkIcon className="h-3 w-3" />
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <NoSymbolIcon className="h-3 w-3" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircleIcon className="h-3 w-3" />
                          Active
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-700">
            <UserIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            {activeFilter === "pending" && "No pending approvals"}
            {activeFilter === "active" && "No active users"}
            {activeFilter === "banned" && "No banned users"}
            {activeFilter === "admins" && "No admin users"}
            {activeFilter === "all" && "No users found"}
          </p>
        </div>
      )}

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
                {selectedUser.approved_at && (
                  <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Approved At:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(selectedUser.approved_at)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <span
                    className={`font-medium ${
                      selectedUser.is_banned ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {selectedUser.is_banned ? "Banned" : "Active"}
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
                {!selectedUser.is_banned ? (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowBanModal(true);
                    }}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white transition-all hover:bg-red-600"
                  >
                    Ban User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUnbanUser(selectedUser.id, selectedUser.name);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-white transition-all hover:bg-green-600"
                  >
                    Unban User
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
