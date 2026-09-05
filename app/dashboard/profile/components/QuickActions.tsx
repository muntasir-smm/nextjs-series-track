// app/dashboard/profile/components/QuickActions.tsx

"use client";

import { BellIcon, KeyIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export function QuickActions() {
  return (
    <div className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:block">
      <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
        Quick Actions
      </h4>
      <div className="space-y-1">
        <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
          <BellIcon className="h-4 w-4 text-slate-400" />
          Notification Settings
        </button>
        <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
          <KeyIcon className="h-4 w-4 text-slate-400" />
          Change Password
        </button>
        <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
          <GlobeAltIcon className="h-4 w-4 text-slate-400" />
          Language Preferences
        </button>
      </div>
    </div>
  );
}
