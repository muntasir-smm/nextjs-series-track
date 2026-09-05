// app/dashboard/profile/components/profile-view.tsx

"use client";

import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  TrophyIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

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
  const fields = [
    {
      label: "Full Name",
      value: profile.name,
      icon: UserIcon,
      iconBg: "bg-brand-100 dark:bg-brand-950/40",
      iconColor: "text-brand-600 dark:text-brand-400",
    },
    {
      label: "Email Address",
      value: profile.email,
      icon: EnvelopeIcon,
      iconBg: "bg-violet-100 dark:bg-violet-950/40",
      iconColor: "text-violet-600 dark:text-violet-400",
      breakAll: true,
    },
    {
      label: "Member Since",
      value: formatDate(profile.created_at),
      icon: CalendarIcon,
      iconBg: "bg-emerald-100 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Member Duration",
      value: getMemberDuration(),
      icon: TrophyIcon,
      iconBg: "bg-orange-100 dark:bg-orange-950/40",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${field.iconBg}`}
            >
              <field.icon className={`h-5 w-5 ${field.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {field.label}
              </p>
              <p
                className={`mt-1 font-medium text-slate-900 dark:text-white ${
                  field.breakAll ? "break-all" : ""
                }`}
              >
                {field.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          <PencilIcon className="h-4 w-4" />
          Edit Profile
        </button>
      </div>
    </div>
  );
};
