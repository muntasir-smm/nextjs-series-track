// app/admin/components/BackupRestore.tsx

"use client";

import { useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function BackupRestore() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/backup");
      const backup = await response.json();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `series-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({
        type: "success",
        text: "Backup created and downloaded successfully!",
      });
    } catch (error) {
      console.error("Backup error:", error);
      setMessage({ type: "error", text: "Failed to create backup" });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !confirm(
        "WARNING: Restoring will overwrite existing data! Are you absolutely sure?",
      )
    ) {
      event.target.value = "";
      return;
    }
    setIsRestoring(true);
    setMessage(null);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backup),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage({
          type: "success",
          text: "Restore completed successfully!",
        });
      } else {
        setMessage({ type: "error", text: result.error || "Restore failed" });
      }
    } catch (error) {
      console.error("Restore error:", error);
      setMessage({ type: "error", text: "Invalid backup file" });
    } finally {
      setIsRestoring(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-5">
      {message && (
        <div
          className={clsx(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
          )}
        >
          {message.type === "success" ? (
            <CheckCircleIcon className="h-5 w-5 shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Export */}
      <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-950/40">
            <ArrowDownTrayIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Export Backup
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Download a complete backup of all user data, series, and settings
            </p>
          </div>
          <button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isBackingUp ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-4 w-4" />
                Export Backup
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
            <ArrowUpTrayIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Import Backup
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Restore data from a backup file (this will overwrite existing
              data)
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600">
            {isRestoring ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Restoring...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-4 w-4" />
                Import Backup
              </>
            )}
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              disabled={isRestoring}
              className="hidden"
            />
          </label>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <ExclamationTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Warning: Restoring will overwrite all existing data. This action
          cannot be undone.
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
          What&apos;s included in backup
        </h4>
        <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <li>• All user accounts (names, emails, roles, status)</li>
          <li>• All user series data (watch progress, seasons, posters)</li>
          <li>• Featured series configuration</li>
          <li>• Announcements</li>
        </ul>
      </div>
    </div>
  );
}
