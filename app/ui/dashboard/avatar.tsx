// app/ui/dashboard/avatar.tsx

"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState, useEffect } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded" | "square";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-lg",
};

const shapes = {
  circle: "rounded-full",
  rounded: "rounded-xl",
  square: "rounded-none",
};

export default function Avatar({
  src,
  name,
  size = "md",
  shape = "circle",
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

  // If image exists and no error, show image
  if (imageSrc && !imgError) {
    return (
      <Image
        src={imageSrc}
        alt={name || "Avatar"}
        width={parseInt(sizes[size].split(" ")[0].replace("h-", "")) * 4}
        height={parseInt(sizes[size].split(" ")[0].replace("h-", "")) * 4}
        className={`${shapes[shape]} object-cover ${sizes[size]} ${className}`}
        onError={() => {
          console.error("Image failed to load:", imageSrc);
          setImgError(true);
        }}
      />
    );
  }

  // Fallback to initials or default icon
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white ${shapes[shape]} ${sizes[size]} ${className}`}
    >
      {getInitials() !== "?" ? (
        <span className="font-medium">{getInitials()}</span>
      ) : (
        <UserCircleIcon className="h-full w-full" />
      )}
    </div>
  );
}
