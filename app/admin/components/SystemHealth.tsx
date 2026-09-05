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
import clsx from "clsx";

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
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
      case "degraded":
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30";
      case "degraded":
        return "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30";
      default:
        return "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-500">
            Checking system health...
          </p>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">Failed to load health status</p>
        <button
          onClick={loadHealth}
          className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            System Health
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last checked: {lastChecked?.toLocaleTimeString() || "Never"}
          </p>
        </div>
        <button
          onClick={loadHealth}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={clsx(
              "rounded-2xl border p-4 transition",
              getStatusColor(item.status),
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
                    Status: {item.status}
                  </p>
                </div>
              </div>
              {getStatusIcon(item.status)}
            </div>

            {item.details && (
              <div className="mt-3 space-y-1 border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
                {Object.entries(item.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize text-slate-500">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
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

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Overall System Status
            </h4>
            <p className="text-sm text-slate-500">
              {health.system.status === "healthy"
                ? "All systems operational"
                : health.system.status === "degraded"
                  ? "Some systems are experiencing issues"
                  : "System is experiencing problems"}
            </p>
          </div>
          <div className="text-right">
            <div
              className={clsx(
                "text-2xl font-bold",
                health.system.status === "healthy"
                  ? "text-emerald-600"
                  : health.system.status === "degraded"
                    ? "text-amber-600"
                    : "text-red-600",
              )}
            >
              {health.system.status === "healthy"
                ? "100%"
                : health.system.status === "degraded"
                  ? "75%"
                  : "50%"}
            </div>
            <p className="text-xs text-slate-500">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
