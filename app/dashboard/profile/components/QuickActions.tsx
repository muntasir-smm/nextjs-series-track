// app/dashboard/profile/components/QuickActions.tsx

"use client";

import { BellIcon, KeyIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export function QuickActions() {
  return (
    <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">
        Quick Actions
      </h4>
      <div className="space-y-1 sm:space-y-2">
        <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
          <BellIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Notification Settings
        </button>
        <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
          <KeyIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Change Password
        </button>
        <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
          <GlobeAltIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Language Preferences
        </button>
      </div>
    </div>
  );
}
