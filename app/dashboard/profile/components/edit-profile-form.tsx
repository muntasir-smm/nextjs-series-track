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
  SparklesIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

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
  const [formData, setFormData] = useState({
    name: profile.name,
  });
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(avatarUrl);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // CRITICAL FIX: Sync tempAvatarUrl when avatarUrl prop changes
  useEffect(() => {
    setTempAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  // Check if form has unsaved changes - compare with original profile
  const isDirty = useMemo(() => {
    const nameChanged = formData.name !== profile.name;
    const avatarChanged = tempAvatarUrl !== profile.avatar_url;

    return nameChanged || avatarChanged;
  }, [formData.name, profile.name, tempAvatarUrl, profile.avatar_url]);

  // Validate name field
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

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDirty || !isFormValid) {
      return;
    }

    setMessage(null);
    try {
      await onSave(formData.name, tempAvatarUrl);
    } catch (error) {
      console.error("Save failed:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile",
      });
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

  const inputVariants = {
    focused: { scale: 1.01, transition: { duration: 0.2 } },
    blurred: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Status Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`rounded-xl p-4 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <p
                className={`text-sm ${
                  message.type === "success"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {message.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 p-4"
      >
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Editing Profile
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update your personal information. Your email address cannot be
              changed for security reasons.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Picture Section */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheckIcon className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Profile Picture
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
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

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Full Name
            <span className="ml-1 text-red-500">*</span>
          </label>
          <motion.div
            animate={focusedField === "name" ? "focused" : "blurred"}
            variants={inputVariants}
            className="relative"
          >
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <UserIcon className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-500" />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              className={`w-full rounded-xl border-2 bg-white pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${
                nameError && touchedFields.has("name")
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10 dark:border-gray-700"
              }`}
              placeholder="Enter your full name"
            />
            {isDirty && formData.name !== profile.name && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              </div>
            )}
          </motion.div>
          {nameError && touchedFields.has("name") && (
            <p className="text-xs text-red-500">{nameError}</p>
          )}
          <p className="text-xs text-gray-500">
            This is the name that will be displayed on your profile
          </p>
        </div>

        {/* Email Field (Read-only) */}
        <div className="space-y-2 opacity-75">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <ShieldCheckIcon className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <ShieldCheckIcon className="h-3 w-3" />
            Email cannot be changed for security reasons
          </p>
        </div>
      </div>

      {/* Unsaved Changes Indicator */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400"
          >
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs">You have unsaved changes</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSaving || isAvatarUploading || !isFormValid}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-white font-medium text-sm hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSaving ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckIcon className="h-5 w-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Form Footer */}
      <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
        By saving changes, you agree to our terms and conditions
      </p>
    </motion.form>
  );
};
