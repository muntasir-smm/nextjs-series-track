// app/admin/components/UserTable/ResetPasswordModal.tsx

"use client";

import { useState } from "react";
import { XMarkIcon, KeyIcon } from "@heroicons/react/24/outline";
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

    if (passwordToSet.length < 6) {
      // Show error through parent
      return;
    }

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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <KeyIcon className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="mt-1 text-sm text-gray-500">For {user.name}</p>
          </div>

          {generatedPassword ? (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
              <p className="text-sm text-green-600 dark:text-green-400">
                New password created!
              </p>
              <code className="mt-2 block rounded bg-white px-3 py-2 text-sm font-mono text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                {generatedPassword}
              </code>
              <p className="mt-2 text-xs text-gray-500">
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
                className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mb-4 text-xs text-gray-500">
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
                  className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white transition-all hover:bg-amber-600 disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
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
