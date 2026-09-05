// app/dashboard/profile/components/edit-profile-form.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ProfileImageUpload from "./profile-image-upload";
import {
  UserIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

interface EditProfileFormProps {
  profile: UserProfile;
  avatarUrl: string | null;
  onAvatarChange: (newAvatarUrl: string | null) => void;
  onSave: (name: string, avatarUrl: string | null) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  avatarUrl,
  onAvatarChange,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [formData, setFormData] = useState({ name: profile.name });
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(avatarUrl);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTempAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const isDirty = useMemo(() => {
    return (
      formData.name !== profile.name || tempAvatarUrl !== profile.avatar_url
    );
  }, [formData.name, profile.name, tempAvatarUrl, profile.avatar_url]);

  const nameError = useMemo(() => {
    if (!touchedFields.has("name")) return null;
    if (!formData.name.trim()) return "Name is required";
    if (formData.name.length < 2) return "Name must be at least 2 characters";
    if (formData.name.length > 50)
      return "Name must be less than 50 characters";
    return null;
  }, [formData.name, touchedFields]);

  const isFormValid = !nameError;

  const handleAvatarChange = useCallback(
    (newAvatarUrl: string | null) => {
      setTempAvatarUrl(newAvatarUrl);
      onAvatarChange(newAvatarUrl);
    },
    [onAvatarChange],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || !isFormValid) return;
    setMessage(null);
    try {
      await onSave(formData.name, tempAvatarUrl);
    } catch {
      setMessage({ type: "error", text: "Failed to update profile" });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (
        confirm("You have unsaved changes. Are you sure you want to cancel?")
      ) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={clsx(
              "rounded-xl border p-3.5",
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30",
            )}
          >
            <div className="flex items-center gap-2.5">
              {message.type === "success" ? (
                <CheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XMarkIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <p
                className={clsx(
                  "text-sm",
                  message.type === "success"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-700 dark:text-red-400",
                )}
              >
                {message.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900/50 dark:bg-brand-950/30">
        <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Editing Profile
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Update your personal information. Your email cannot be changed for
            security reasons.
          </p>
        </div>
      </div>

      {/* Avatar */}
      <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/40">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Profile Picture
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Upload a new avatar or change your profile image
          </p>
        </div>
        <ProfileImageUpload
          currentAvatar={tempAvatarUrl}
          userName={profile.name}
          onAvatarChange={handleAvatarChange}
          onUploadStart={() => setIsAvatarUploading(true)}
          onUploadEnd={() => setIsAvatarUploading(false)}
        />
      </div>

      {/* Fields */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ name: e.target.value });
                setTouchedFields((prev) => new Set(prev).add("name"));
              }}
              className={clsx(
                "w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition dark:bg-slate-800 dark:text-white",
                nameError
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600",
              )}
              placeholder="Enter your full name"
            />
          </div>
          {nameError && <p className="text-xs text-red-500">{nameError}</p>}
        </div>

        <div className="space-y-1.5 opacity-75">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <div className="relative">
            <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
            />
            <ShieldCheckIcon className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          </div>
          <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <ShieldCheckIcon className="h-3 w-3" />
            Email cannot be changed for security reasons
          </p>
        </div>
      </div>

      {isDirty && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          <span className="text-xs">You have unsaved changes</span>
        </div>
      )}

      <div className="flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="submit"
          disabled={isSaving || isAvatarUploading || !isFormValid || !isDirty}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <XMarkIcon className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
};
