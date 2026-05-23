// app/ui/tvSeries/progress-bar.tsx

"use client";

import React, { useId, memo } from "react";
import clsx from "clsx";

// ====================================
// Types
// ====================================

type ProgressSize = "sm" | "md" | "lg";

interface ProgressBarProps {
  width: string;
  children?: React.ReactNode;
  showPercentage?: boolean;
  size?: ProgressSize;
  className?: string;
  animate?: boolean;
}

interface ProgressRingProps {
  progress: number;
  size?: ProgressSize;
  showPercentage?: boolean;
  className?: string;
  animate?: boolean;
}

interface ProgressProps {
  type: "bar" | "ring";
  value: number;
  showPercentage?: boolean;
  size?: ProgressSize;
  className?: string;
  animate?: boolean;
}

// ====================================
// Constants
// ====================================

const BAR_HEIGHTS: Record<ProgressSize, string> = {
  sm: "h-2",
  md: "h-5",
  lg: "h-8",
};

const TEXT_SIZES: Record<ProgressSize, string> = {
  sm: "text-[10px]",
  md: "text-sm",
  lg: "text-base",
};

const RING_CONFIG: Record<
  ProgressSize,
  {
    wrapper: string;
    radius: number;
    stroke: number;
    textSize: string;
    dimension: number;
  }
> = {
  sm: {
    wrapper: "w-8 h-8",
    radius: 12,
    stroke: 3,
    textSize: "text-[9px]",
    dimension: 30,
  },
  md: {
    wrapper: "w-12 h-12",
    radius: 20,
    stroke: 3,
    textSize: "text-[11px]",
    dimension: 46,
  },
  lg: {
    wrapper: "w-16 h-16",
    radius: 28,
    stroke: 4,
    textSize: "text-sm",
    dimension: 62,
  },
};

// ====================================
// Utils
// ====================================

const clampProgress = (value: number): number => {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
};

const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// ====================================
// Progress Bar Component
// ====================================

const ProgressBar: React.FC<ProgressBarProps> = memo(
  ({
    width,
    children,
    showPercentage = true,
    size = "md",
    className = "",
    animate = true,
  }) => {
    const percentage = width || "0%";

    return (
      <div
        className={clsx(
          "relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
          BAR_HEIGHTS[size],
          className,
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={parseFloat(percentage)}
        aria-label="Progress bar"
      >
        <div
          className={clsx(
            "flex h-full items-center justify-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
            {
              "rounded-full": size === "sm",
              "rounded-md": size !== "sm",
              "transition-all duration-500 ease-out": animate,
            },
          )}
          style={{ width: percentage }}
        />

        {showPercentage && (
          <span
            className={clsx(
              "absolute inset-0 flex items-center justify-center font-bold",
              size === "sm"
                ? "text-gray-700 dark:text-gray-300"
                : "text-white drop-shadow-sm",
              TEXT_SIZES[size],
            )}
          >
            {children || formatPercentage(parseFloat(percentage))}
          </span>
        )}
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";

// ====================================
// Progress Ring Component
// ====================================

const ProgressRing: React.FC<ProgressRingProps> = memo(
  ({
    progress,
    size = "md",
    showPercentage = true,
    className = "",
    animate = true,
  }) => {
    const gradientId = useId();
    const safeProgress = clampProgress(progress);
    const { wrapper, radius, stroke, textSize, dimension } = RING_CONFIG[size];

    const normalizedRadius = radius;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset =
      circumference - (safeProgress / 100) * circumference;

    // Center coordinate for the SVG
    const center = dimension / 2;
    const viewBoxSize = dimension;

    return (
      <div
        className={clsx(
          "relative inline-flex items-center justify-center",
          wrapper,
          className,
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(safeProgress)}
        aria-label="Progress ring"
      >
        {/* Background Blur for contrast */}
        <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-[2px]" />

        <svg
          className="relative -rotate-90 transform"
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>

            {/* Optional: Add glow filter */}
            <filter
              id={`glow-${gradientId}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={normalizedRadius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-white/20"
          />

          {/* Animated Progress */}
          <circle
            cx={center}
            cy={center}
            r={normalizedRadius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={animate ? "transition-all duration-500 ease-out" : ""}
            style={{
              filter: "drop-shadow(0 1px 3px #00000059)",
            }}
          />
        </svg>

        {/* Percentage Text */}
        {showPercentage && (
          <span
            className={clsx(
              "absolute rounded-full px-1.5 py-0.5 font-bold text-white",
              textSize,
            )}
          >
            {formatPercentage(safeProgress)}
          </span>
        )}
      </div>
    );
  },
);

ProgressRing.displayName = "ProgressRing";

// ====================================
// Combined Progress Component
// ====================================

const Progress: React.FC<ProgressProps> = ({
  type,
  value,
  showPercentage = true,
  size = "md",
  className = "",
  animate = true,
}) => {
  const safeValue = clampProgress(value);

  if (type === "ring") {
    return (
      <ProgressRing
        progress={safeValue}
        size={size}
        showPercentage={showPercentage}
        className={className}
        animate={animate}
      />
    );
  }

  return (
    <ProgressBar
      width={formatPercentage(safeValue)}
      size={size}
      showPercentage={showPercentage}
      className={className}
      animate={animate}
    >
      {formatPercentage(safeValue)}
    </ProgressBar>
  );
};

// ====================================
// Exports
// ====================================

export { ProgressBar, ProgressRing, Progress };

export default ProgressBar;
