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
import clsx from "clsx";

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

  const stats = {
    total: users.length,
    pending: users.filter((u) => !u.is_approved).length,
    active: users.filter((u) => u.is_approved && !u.is_banned && u.is_active)
      .length,
    banned: users.filter((u) => u.is_banned).length,
    admins: users.filter((u) => u.role === "admin").length,
  };

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
    } catch {
      showMessage("error", `Failed to ${action}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {message && (
        <div
          className={clsx(
            "rounded-xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
          )}
        >
          {message.text}
        </div>
      )}

      {/* Filter stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Users"
          value={stats.total}
          filter="all"
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          icon="UserIcon"
          color="from-slate-500 to-slate-600"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          filter="pending"
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          icon="ClockIcon"
          color="from-amber-500 to-orange-500"
        />
        <StatCard
          label="Active"
          value={stats.active}
          filter="active"
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          icon="CheckCircleIcon"
          color="from-emerald-500 to-teal-500"
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
          color="from-violet-500 to-purple-500"
        />
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Pending */}
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

      {/* Approved */}
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
          onUnban={(userId) => handleAction("unban", userId)}
          onMakeAdmin={(userId) => handleAction("makeAdmin", userId)}
          onRemoveAdmin={(userId) => handleAction("removeAdmin", userId)}
          loadingAction={loadingAction}
        />
      )}

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
        onUnban={(userId) => {
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
