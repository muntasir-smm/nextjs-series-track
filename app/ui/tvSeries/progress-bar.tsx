// app/ui/tvSeries/progress-bar.tsx

"use client";

import React from "react";
import clsx from "clsx";

type ProgressBarProps = {
  width: string;
  children: React.ReactNode;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  width,
  children,
  showPercentage = true,
  size = "md",
}) => {
  const heights = {
    sm: "h-2",
    md: "h-5",
    lg: "h-8",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={clsx(
        "relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
        heights[size],
      )}
    >
      <div
        className={clsx(
          "flex h-full items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out",
          {
            "rounded-full": size === "sm",
            "rounded-md": size === "md" || size === "lg",
          },
        )}
        style={{ width: width || "0%" }}
      >
        {showPercentage && size !== "sm" && (
          <span
            className={clsx(
              "absolute inset-0 flex items-center justify-center font-bold text-white",
              textSizes[size],
            )}
          >
            {children}
          </span>
        )}
      </div>

      {/* Show percentage outside for small size */}
      {showPercentage && size === "sm" && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
          {children}
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
