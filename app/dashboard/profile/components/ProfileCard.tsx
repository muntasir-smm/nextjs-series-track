// app/dashboard/profile/components/ProfileCard.tsx

"use client";

import { ShieldCheckIcon, CheckIcon } from "@heroicons/react/24/outline";
import Avatar from "@/app/ui/dashboard/avatar";
import clsx from "clsx";

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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-r from-brand-500 via-violet-500 to-pink-500 sm:h-24">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 sm:-bottom-12">
          <div className="relative">
            <div className="rounded-2xl bg-white p-1 shadow-lg dark:bg-slate-900">
              <Avatar
                src={avatarUrl}
                name={profile.name}
                size="xl"
                shape="rounded"
              />
            </div>
            {profile.role === "admin" && (
              <div className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 p-1 shadow">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-5 pt-14 text-center sm:px-6 sm:pt-16">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {profile.name}
        </h3>
        <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
          {profile.email}
        </p>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              profile.role === "admin"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                : "bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400",
            )}
          >
            <ShieldCheckIcon className="h-3 w-3" />
            {profile.role === "admin" ? "Admin" : "Member"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckIcon className="h-3 w-3" />
            Active
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-2.5 border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Member since
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatDate(profile.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Duration</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {getMemberDuration()}
          </span>
        </div>
      </div>
    </div>
  );
}
