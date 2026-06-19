// app/dashboard/profile/components/SecurityTab.tsx

"use client";

import {
  KeyIcon,
  DeviceTabletIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";

export function SecurityTabContent() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Security Settings
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account security
        </p>
      </div>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300 text-sm sm:text-base">
                Password Protection
              </p>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                Last changed 30 days ago
              </p>
            </div>
          </div>
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-all">
            Change Password
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <DeviceTabletIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                Two-Factor Authentication
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Add an extra layer of security
              </p>
            </div>
          </div>
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
            Enable
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FingerPrintIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                Active Sessions
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Manage devices where you&apos;re logged in
              </p>
            </div>
          </div>
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}
