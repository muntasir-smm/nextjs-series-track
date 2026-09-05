// app/admin/components/UserTable/BanUserModal.tsx

"use client";

import { useState } from "react";
import { XMarkIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import Avatar from "@/app/ui/dashboard/avatar";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
              <NoSymbolIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Ban User
            </h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Avatar
                src={user.avatar_url}
                name={user.name}
                size="sm"
                shape="circle"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user.name}
              </p>
            </div>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for ban (optional)"
            rows={3}
            className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />

          <div className="flex gap-3">
            <button
              onClick={handleBan}
              disabled={loadingAction !== null}
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {loadingAction === "ban" ? "Banning..." : "Ban User"}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
