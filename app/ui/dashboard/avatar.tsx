// app/ui/dashboard/avatar.tsx

"use client";

import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-6 w-6 text-sm",
  md: "h-8 w-8 text-base",
  lg: "h-12 w-12 text-lg",
};

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Get initials from name
  const getInitials = () => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // If image exists and no error, show image
  if (src && !imgError) {
    return (
      <div className={`relative ${sizes[size]} ${className}`}>
        <Image
          src={src}
          alt={name || "Avatar"}
          fill
          className="rounded-full object-cover"
          onError={() => setImgError(true)}
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
