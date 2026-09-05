// app/dashboard/profile/components/ProfileTab.tsx

"use client";

import { EditProfileForm } from "./edit-profile-form";
import { ProfileView } from "./profile-view";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

interface ProfileTabContentProps {
  profile: UserProfile;
  isEditing: boolean;
  isSaving: boolean;
  avatarUrl: string | null;
  tempAvatarUrl: string | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (name: string, avatarUrl: string | null) => Promise<void>;
  onAvatarChange: (url: string | null) => void;
  formatDate: (date: string) => string;
  getMemberDuration: () => string;
}

export function ProfileTabContent({
  profile,
  isEditing,
  isSaving,
  tempAvatarUrl,
  onEdit,
  onCancel,
  onSave,
  onAvatarChange,
  formatDate,
  getMemberDuration,
}: ProfileTabContentProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Profile Information
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isEditing
            ? "Update your personal details"
            : "View your personal details"}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {isEditing ? (
          <EditProfileForm
            profile={profile}
            avatarUrl={tempAvatarUrl}
            onAvatarChange={onAvatarChange}
            onSave={onSave}
            onCancel={onCancel}
            isSaving={isSaving}
          />
        ) : (
          <ProfileView
            profile={profile}
            onEdit={onEdit}
            formatDate={formatDate}
            getMemberDuration={getMemberDuration}
          />
        )}
      </div>
    </div>
  );
}
