// app/dashboard/profile/components/PreferencesTab.tsx

"use client";

import { BellIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export function PreferencesTabContent() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Preferences
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Customize your experience
        </p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* Notifications */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
              <BellIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Email Notifications
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Receive updates about your activity
              </p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" defaultChecked className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-brand-300 dark:bg-slate-700 dark:peer-focus:ring-brand-800" />
          </label>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
              <GlobeAltIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Language
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose your preferred language
              </p>
            </div>
          </div>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            <option>English</option>
            <option>বাংলা</option>
          </select>
        </div>
      </div>
    </div>
  );
}
