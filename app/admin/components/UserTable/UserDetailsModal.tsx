// app/admin/components/UserTable/UserDetailsModal.tsx

"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import type { User } from "./types";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-gray-800 animate-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
              <span className="text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">User ID:</span>
              <span className="font-mono text-sm text-gray-900 dark:text-white">
                {user.id}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Role:</span>
              <span
                className={`font-medium ${user.role === "admin" ? "text-purple-600" : "text-gray-900 dark:text-white"}`}
              >
                {user.role}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Member Since:
              </span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(user.created_at)}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Last Login:
              </span>
              <span className="text-gray-900 dark:text-white">
                {user.last_login ? formatDate(user.last_login) : "Never"}
              </span>
            </div>
            {user.approved_at && (
              <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Approved At:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(user.approved_at)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`font-medium ${user.is_banned ? "text-red-600" : "text-green-600"}`}
              >
                {user.is_banned ? "Banned" : "Active"}
              </span>
            </div>
            {user.ban_reason && (
              <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Ban Reason:
                </span>
                <span className="text-red-600 dark:text-red-400">
                  {user.ban_reason}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {!user.is_banned ? (
              <button
                onClick={() => {
                  onBan();
                  onClose();
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white transition-all hover:bg-red-600"
              >
                Ban User
              </button>
            ) : (
              <button
                onClick={() => {
                  onUnban(user.id, user.name);
                  onClose();
                }}
                className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-white transition-all hover:bg-green-600"
              >
                Unban User
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
