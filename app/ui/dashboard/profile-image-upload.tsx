// app/ui/dashboard/profile-image-upload.tsx

"use client";

import { useState, useRef } from "react";
import {
  CameraIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Avatar from "./avatar";
import imageCompression from "browser-image-compression";

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
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.2, // Compress to max 200KB
      maxWidthOrHeight: 512, // Max 512px width or height
      useWebWorker: true,
      fileType: "image/jpeg", // Convert to JPEG for better compression
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(
        `Compressed from ${(file.size / 1024).toFixed(2)}KB to ${(compressedFile.size / 1024).toFixed(2)}KB`,
      );
      return compressedFile;
    } catch (error) {
      console.error("Compression error:", error);
      return file; // Return original if compression fails
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    setIsUploading(true);
    setError(null);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      // Convert to JPEG for better compression
      const blob = compressedFile.slice(0, compressedFile.size, "image/jpeg");
      formData.append("avatar", blob, `${file.name.split(".")[0]}.jpg`);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onAvatarUpdate(data.avatarUrl);
        setLocalPreview(null);
        setError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(data.error || "Failed to upload image");
        setLocalPreview(null);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try a smaller image.");
      setLocalPreview(null);
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
        onAvatarUpdate("");
        setLocalPreview(null);
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

  const displayAvatar = localPreview || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer focus:outline-none"
          disabled={isUploading}
          type="button"
        >
          <Avatar
            src={displayAvatar}
            name={userName}
            size="lg"
            className="ring-2 ring-gray-200 transition-all group-hover:ring-blue-400 dark:ring-gray-700"
          />

          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <CameraIcon className="h-6 w-6 text-white" />
          </div>
        </button>

        {currentAvatar && !localPreview && (
          <button
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 rounded-full bg-red-500 p-1.5 text-white transition-all hover:bg-red-600 disabled:opacity-50"
            title="Remove avatar"
            type="button"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          Compressing & Uploading...
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-400">
        Click avatar to change • Images will be compressed automatically • Max
        3MB
      </p>
    </div>
  );
}
