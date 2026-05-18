// app/admin/components/SystemHealth.tsx

"use client";

import { useState, useEffect } from "react";
import {
  ServerIcon,
  CloudIcon,
  PhotoIcon,
  CpuChipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface HealthStatus {
  database: { status: string; details: any };
  tmdb: { status: string; details: any };
  blob: { status: string; details: any };
  system: { status: string; details: any };
  timestamp: string;
}

export default function SystemHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const loadHealth = async () => {
    try {
      const response = await fetch("/api/admin/health");
      const data = await response.json();
      setHealth(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Error loading health status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
      case "degraded":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20";
      default:
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Checking system health...</p>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load health status</p>
        <button
          onClick={loadHealth}
          className="mt-2 text-sm text-blue-500 hover:text-blue-600"
        >
          Try again
        </button>
      </div>
    );
  }

  const items = [
    {
      id: "database",
      title: "Database",
      icon: ServerIcon,
      status: health.database.status,
      details: health.database.details,
    },
    {
      id: "tmdb",
      title: "TMDB API",
      icon: CloudIcon,
      status: health.tmdb.status,
      details: health.tmdb.details,
    },
    {
      id: "blob",
      title: "Vercel Blob Storage",
      icon: PhotoIcon,
      status: health.blob.status,
      details: health.blob.details,
    },
    {
      id: "system",
      title: "System Configuration",
      icon: CpuChipIcon,
      status: health.system.status,
      details: health.system.details,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Health
          </h3>
          <p className="text-sm text-gray-500">
            Last checked: {lastChecked?.toLocaleTimeString() || "Never"}
          </p>
        </div>
        <button
          onClick={loadHealth}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Health Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border p-4 transition-all ${getStatusColor(item.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className="h-6 w-6" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-sm capitalize text-gray-600 dark:text-gray-400">
                    Status: {item.status}
                  </p>
                </div>
              </div>
              {getStatusIcon(item.status)}
            </div>

            {/* Details */}
            {item.details && (
              <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                {Object.entries(item.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {typeof value === "boolean"
                        ? value
                          ? "Yes"
                          : "No"
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Overall System Status
            </h4>
            <p className="text-sm text-gray-500">
              {health.system.status === "healthy"
                ? "All systems operational"
                : health.system.status === "degraded"
                  ? "Some systems are experiencing issues"
                  : "System is experiencing problems"}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                health.system.status === "healthy"
                  ? "text-green-600"
                  : health.system.status === "degraded"
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {health.system.status === "healthy"
                ? "100%"
                : health.system.status === "degraded"
                  ? "75%"
                  : "50%"}
            </div>
            <p className="text-xs text-gray-500">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
