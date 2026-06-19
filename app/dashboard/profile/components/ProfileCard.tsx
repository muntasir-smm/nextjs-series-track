// app/dashboard/profile/components/ProfileCard.tsx

"use client";

import { ShieldCheckIcon, CheckIcon } from "@heroicons/react/24/outline";
import Avatar from "@/app/ui/dashboard/avatar";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

interface ProfileCardProps {
  profile: UserProfile;
  avatarUrl: string | null;
  formatDate: (date: string) => string;
  getMemberDuration: () => string;
}

export function ProfileCard({
  profile,
  avatarUrl,
  formatDate,
  getMemberDuration,
}: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="relative h-20 sm:h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
        <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="relative group">
            <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900 p-1 shadow-xl">
              <Avatar
                src={avatarUrl}
                name={profile.name}
                size="xl"
                shape="rounded"
              />
            </div>
            {profile.role === "admin" && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-1 shadow-lg">
                <ShieldCheckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-12 sm:pt-16 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
          {profile.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
          {profile.email}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
          <span
            className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
              profile.role === "admin"
                ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            <ShieldCheckIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {profile.role === "admin" ? "Admin" : "Member"}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Active
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">Member since</span>
          <span className="font-medium text-gray-900 dark:text-white text-right">
            {formatDate(profile.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Member duration
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {getMemberDuration()}
          </span>
        </div>
      </div>
    </div>
  );
}
