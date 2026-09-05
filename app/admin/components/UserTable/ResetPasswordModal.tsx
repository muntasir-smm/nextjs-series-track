// app/admin/components/UserTable/ResetPasswordModal.tsx

"use client";

import { useState } from "react";
import { XMarkIcon, KeyIcon } from "@heroicons/react/24/outline";
import Avatar from "@/app/ui/dashboard/avatar";
import type { User } from "./types";

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onResetPassword: (action: string, userId: string, data: any) => Promise<void>;
}

export function ResetPasswordModal({
  isOpen,
  user,
  onClose,
  onResetPassword,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const generateRandomPassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleReset = async () => {
    let passwordToSet = newPassword;
    if (!passwordToSet) {
      passwordToSet = generateRandomPassword();
    }
    if (passwordToSet.length < 6) return;

    setLoading(true);
    await onResetPassword("resetPassword", user.id, {
      newPassword: passwordToSet,
    });
    setGeneratedPassword(passwordToSet);
    setLoading(false);
  };

  const handleClose = () => {
    setNewPassword("");
    setGeneratedPassword(null);
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
              <KeyIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Reset Password
            </h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Avatar
                src={user.avatar_url}
                name={user.name}
                size="sm"
                shape="circle"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                For {user.name}
              </p>
            </div>
          </div>

          {generatedPassword ? (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                New password created!
              </p>
              <code className="mt-2 block rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                {generatedPassword}
              </code>
              <p className="mt-2 text-xs text-slate-500">
                Share this password with the user
              </p>
            </div>
          ) : (
            <>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mb-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <p className="mb-4 text-xs text-slate-500">
                Leave empty to generate a random password
              </p>
            </>
          )}

          <div className="flex gap-3">
            {!generatedPassword ? (
              <>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
