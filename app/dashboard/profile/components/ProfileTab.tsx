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
  avatarUrl,
  tempAvatarUrl,
  onEdit,
  onCancel,
  onSave,
  onAvatarChange,
  formatDate,
  getMemberDuration,
}: ProfileTabContentProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Profile Information
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditing
                ? "Update your personal details"
                : "View your personal details"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
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
