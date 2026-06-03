// app/admin/components/UserTable/BanUserModal.tsx

"use client";

import { useState } from "react";
import { XMarkIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import type { User } from "./types";

interface BanUserModalProps {
  isOpen: boolean;
  user: User | null;
  banReason: string;
  onBan: (userId: string, reason: string) => void;
  onClose: () => void;
  loadingAction: string | null;
}

export function BanUserModal({
  isOpen,
  user,
  onBan,
  onClose,
  loadingAction,
}: BanUserModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen || !user) return null;

  const handleBan = () => {
    onBan(user.id, reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800 animate-in zoom-in duration-200">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="p-6">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <NoSymbolIcon className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Ban User
            </h2>
            <p className="mt-1 text-sm text-gray-500">{user.name}</p>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for ban (optional)"
            rows={3}
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-3">
            <button
              onClick={handleBan}
              disabled={loadingAction !== null}
              className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white transition-all hover:bg-red-600 disabled:opacity-50"
            >
              {loadingAction === "ban" ? "Banning..." : "Ban User"}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
