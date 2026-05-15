// app/ui/dashboard/avatar.tsx

"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-12 w-12 text-base",
};

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    setImageSrc(src || null);
    setImgError(false);
  }, [src]);

  const getInitials = () => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // If image exists and no error, show image using Next.js Image
  if (imageSrc && !imgError) {
    return (
      <div className={`relative ${sizes[size]} ${className}`}>
        <Image
          src={imageSrc}
          alt={name || "Avatar"}
          fill
          className="rounded-full object-cover"
          onError={() => {
            console.error("Image failed to load:", imageSrc);
            setImgError(true);
          }}
          onLoad={() => console.log("Image loaded:", imageSrc)}
          unoptimized // Bypass optimization for external URLs
        />
      </div>
    );
  }

  // Fallback to initials or default icon
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white ${sizes[size]} ${className}`}
    >
      {getInitials() !== "?" ? (
        <span className="font-medium">{getInitials()}</span>
      ) : (
        <UserCircleIcon className="h-full w-full" />
      )}
    </div>
  );
}
