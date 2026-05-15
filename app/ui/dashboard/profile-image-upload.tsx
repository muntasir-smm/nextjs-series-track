// app/ui/dashboard/profile-image-upload.tsx

"use client";

import { useState, useRef } from "react";
import {
  CameraIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Avatar from "./avatar";

interface ProfileImageUploadProps {
  currentAvatar: string | null;
  userName: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export default function ProfileImageUpload({
  currentAvatar,
  userName,
  onAvatarUpdate,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onAvatarUpdate(data.avatarUrl);
        setError(null);
      } else {
        setError(data.error || "Failed to upload image");
        setPreviewUrl(currentAvatar);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
      setPreviewUrl(currentAvatar);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?"))
      return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setPreviewUrl(null);
        onAvatarUpdate("");
        setError(null);
      } else {
        setError(data.error || "Failed to remove image");
      }
    } catch (err) {
      console.error("Remove error:", err);
      setError("Failed to remove image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <button
          onClick={handleImageClick}
          className="group relative cursor-pointer focus:outline-none"
          disabled={isUploading}
        >
          <Avatar
            src={previewUrl}
            name={userName}
            size="lg"
            className="ring-4 ring-white shadow-lg transition-all group-hover:ring-blue-200 dark:ring-gray-800"
          />

          {/* Upload Overlay */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <CameraIcon className="h-6 w-6 text-white" />
          </div>
        </button>

        {/* Remove Button */}
        {previewUrl && (
          <button
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 rounded-full bg-red-500 p-1 text-white transition-all hover:bg-red-600 disabled:opacity-50"
            title="Remove avatar"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        Click to upload • JPG, PNG, GIF, WEBP • Max 5MB
      </p>
    </div>
  );
}
