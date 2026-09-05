// app/dashboard/profile/components/SecurityTab.tsx

"use client";

import {
  KeyIcon,
  DeviceTabletIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";

export function SecurityTabContent() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Security Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account security
        </p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* Password */}
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
              <KeyIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Password Protection
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Last changed 30 days ago
              </p>
            </div>
          </div>
          <button className="rounded-xl px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40">
            Change Password
          </button>
        </div>

        {/* 2FA */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
              <DeviceTabletIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add an extra layer of security
              </p>
            </div>
          </div>
          <button className="rounded-xl px-4 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30">
            Enable
          </button>
        </div>

        {/* Sessions */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
              <FingerPrintIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Active Sessions
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage devices where you&apos;re logged in
              </p>
            </div>
          </div>
          <button className="rounded-xl px-4 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30">
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}
