// app/dashboard/profile/components/profile-image-upload.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import {
  CameraIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Avatar from "@/app/ui/dashboard/avatar";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileImageUploadProps {
  currentAvatar: string | null;
  userName: string;
  onAvatarChange: (newAvatarUrl: string | null) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function ProfileImageUpload({
  currentAvatar,
  userName,
  onAvatarChange,
  onUploadStart,
  onUploadEnd,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up temp uploaded image when component unmounts or avatar changes
  useEffect(() => {
    return () => {
      // If there's a temp uploaded URL that wasn't saved, delete it
      if (uploadedUrl && uploadedUrl !== currentAvatar) {
        fetch(`/api/user/avatar/temp?url=${encodeURIComponent(uploadedUrl)}`, {
          method: "DELETE",
        }).catch(console.error);
      }
    };
  }, [uploadedUrl, currentAvatar]);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 512,
      useWebWorker: true,
      fileType: "image/jpeg",
      onProgress: (progress: number) => {
        setUploadProgress(Math.round(progress * 100));
      },
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Compression error:", error);
      return file;
    }
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, GIF, WEBP)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image size must be less than 5MB";
    }
    return null;
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetState();

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    onUploadStart?.();

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      const blob = compressedFile.slice(0, compressedFile.size, "image/jpeg");
      formData.append("avatar", blob, `${file.name.split(".")[0]}.jpg`);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedUrl(data.avatarUrl);
        setLocalPreview(data.avatarUrl);
        onAvatarChange(data.avatarUrl);
        setSuccess(true);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setTimeout(() => setSuccess(false), 2000);
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
      onUploadEnd?.();
    }
  };

  const handleRemoveAvatar = () => {
    // Delete the temp uploaded image from blob
    if (uploadedUrl && uploadedUrl !== currentAvatar) {
      fetch(`/api/user/avatar/temp?url=${encodeURIComponent(uploadedUrl)}`, {
        method: "DELETE",
      }).catch(console.error);
    }
    setLocalPreview(null);
    setUploadedUrl(null);
    onAvatarChange(null);
  };

  const displayAvatar = localPreview || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative focus:outline-none"
          disabled={isUploading}
          type="button"
        >
          <div className="relative">
            <Avatar
              src={displayAvatar}
              name={userName}
              size="lg"
              className="ring-4 ring-gray-200 transition-all duration-300 group-hover:ring-blue-400 dark:ring-gray-700"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <CameraIcon className="h-8 w-8 text-white" />
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/80">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
        </button>

        {displayAvatar && !isUploading && (
          <button
            onClick={handleRemoveAvatar}
            className="absolute -bottom-1 -right-1 rounded-full bg-red-500 p-1.5 text-white transition-all hover:bg-red-600 hover:scale-110"
            title="Remove avatar"
            type="button"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-48"
          >
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-gray-500">
              Compressing... {uploadProgress}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 dark:bg-red-950/30 dark:text-red-400"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-xs">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-center text-xs text-gray-400">
        Click avatar to change • Max 5MB • JPG, PNG, GIF, WEBP
      </p>
    </div>
  );
}
