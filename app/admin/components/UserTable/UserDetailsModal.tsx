// app/admin/components/UserTable/UserDetailsModal.tsx

"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Avatar from "@/app/ui/dashboard/avatar";
import type { User } from "./types";
import clsx from "clsx";

interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onBan: () => void;
  onUnban: (userId: string, userName: string) => void;
}

export function UserDetailsModal({
  isOpen,
  user,
  onClose,
  onBan,
  onUnban,
}: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Avatar
              src={user.avatar_url}
              name={user.name}
              size="lg"
              shape="circle"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { label: "User ID", value: user.id, mono: true },
              { label: "Role", value: user.role },
              { label: "Member Since", value: formatDate(user.created_at) },
              {
                label: "Last Login",
                value: user.last_login ? formatDate(user.last_login) : "Never",
              },
              ...(user.approved_at
                ? [
                    {
                      label: "Approved At",
                      value: formatDate(user.approved_at),
                    },
                  ]
                : []),
              {
                label: "Status",
                value: user.is_banned ? "Banned" : "Active",
                color: user.is_banned ? "text-red-600" : "text-emerald-600",
              },
              ...(user.ban_reason
                ? [
                    {
                      label: "Ban Reason",
                      value: user.ban_reason,
                      color: "text-red-600 dark:text-red-400",
                    },
                  ]
                : []),
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-slate-100 py-2.5 dark:border-slate-800"
              >
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {row.label}
                </span>
                <span
                  className={clsx(
                    "text-sm font-medium text-slate-900 dark:text-white",
                    row.mono && "font-mono text-xs",
                    row.color,
                  )}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            {!user.is_banned ? (
              <button
                onClick={() => {
                  onBan();
                  onClose();
                }}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Ban User
              </button>
            ) : (
              <button
                onClick={() => {
                  onUnban(user.id, user.name);
                  onClose();
                }}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600"
              >
                Unban User
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
