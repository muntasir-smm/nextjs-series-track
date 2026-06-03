// app/admin/components/UserTable.tsx

"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { StatCard } from "./UserTable/StatCard";
import { PendingUsersSection } from "./UserTable/PendingUsersSection";
import { ApprovedUsersTable } from "./UserTable/ApprovedUsersTable";
import { UserDetailsModal } from "./UserTable/UserDetailsModal";
import { ResetPasswordModal } from "./UserTable/ResetPasswordModal";
import { BanUserModal } from "./UserTable/BanUserModal";
import { EmptyState } from "./UserTable/EmptyState";
import type { User, FilterType } from "./UserTable/types";

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
  const [showBanModal, setShowBanModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
  const pendingUsers = users.filter((u) => !u.is_approved);
  const approvedUsers = filteredUsers.filter((u) => u.is_approved);

  const handleAction = async (action: string, userId?: string, data?: any) => {
    if (!userId && action !== "ban") return;
    setLoadingAction(action);
    try {
      const result = await onUpdateUser(userId!, action, data);
      if (result.success) {
        showMessage("success", result.message || `${action} completed`);
        await onRefresh();
        if (action === "ban" || action === "reject") {
          setSelectedUser(null);
          setShowBanModal(false);
        }
      } else {
        showMessage("error", result.message || `Failed to ${action}`);
      }
    } catch (error) {
      showMessage("error", `Failed to ${action}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Toast */}
      {message && (
        <div
          className={`animate-in slide-in-from-top duration-300 rounded-lg p-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Users"
          value={stats.total}
          filter="all"
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          icon="UserIcon"
          color="from-gray-500 to-gray-600"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          filter="pending"
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          icon="ClockIcon"
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          label="Active"
          value={stats.active}
          filter="active"
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          icon="CheckCircleIcon"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          label="Banned"
          value={stats.banned}
          filter="banned"
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          icon="NoSymbolIcon"
          color="from-red-500 to-rose-500"
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          filter="admins"
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          icon="ShieldCheckIcon"
          color="from-purple-500 to-violet-500"
        />
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Pending Approvals Section */}
      {pendingUsers.length > 0 && (
        <PendingUsersSection
          users={pendingUsers}
          onApprove={(userId, userName) =>
            handleAction("approve", userId, { userName })
          }
          onReject={(userId, userName) =>
            handleAction("reject", userId, { userName })
          }
          loadingAction={loadingAction}
        />
      )}

      {/* Approved Users Section */}
      {approvedUsers.length > 0 && (
        <ApprovedUsersTable
          users={approvedUsers}
          activeFilter={activeFilter}
          onViewDetails={(user) => {
            setSelectedUser(user);
            setShowDetailsModal(true);
          }}
          onResetPassword={(user) => {
            setSelectedUser(user);
            setShowPasswordModal(true);
          }}
          onBan={(user) => {
            setSelectedUser(user);
            setShowBanModal(true);
          }}
          onUnban={(userId, userName) => handleAction("unban", userId)}
          onMakeAdmin={(userId, userName) => handleAction("makeAdmin", userId)}
          onRemoveAdmin={(userId, userName) =>
            handleAction("removeAdmin", userId)
          }
          loadingAction={loadingAction}
        />
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && <EmptyState activeFilter={activeFilter} />}

      {/* Modals */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        user={selectedUser}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedUser(null);
        }}
        onBan={() => {
          setShowDetailsModal(false);
          setShowBanModal(true);
        }}
        onUnban={(userId, userName) => {
          handleAction("unban", userId);
          setShowDetailsModal(false);
        }}
      />

      <ResetPasswordModal
        isOpen={showPasswordModal}
        user={selectedUser}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedUser(null);
        }}
        onResetPassword={handleAction}
      />

      <BanUserModal
        isOpen={showBanModal}
        user={selectedUser}
        banReason=""
        onBan={(userId, reason) => handleAction("ban", userId, { reason })}
        onClose={() => {
          setShowBanModal(false);
          setSelectedUser(null);
        }}
        loadingAction={loadingAction}
      />
    </div>
  );
}
