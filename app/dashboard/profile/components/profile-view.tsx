// app/dashboard/profile/components/profile-view.tsx

"use client";

import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  TrophyIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
  formatDate: (date: string) => string;
  getMemberDuration: () => string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onEdit,
  formatDate,
  getMemberDuration,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Full Name
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">
              {profile.name}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Email Address
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white text-sm sm:text-base break-all">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Member Since
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white text-sm sm:text-base">
              {formatDate(profile.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Member Duration
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white text-sm sm:text-base">
              {getMemberDuration()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
        >
          <PencilIcon className="h-4 w-4" />
          Edit Profile
        </button>
      </div>
    </div>
  );
};
