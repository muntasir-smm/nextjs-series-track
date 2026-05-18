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

      // Create download link
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
    <div className="space-y-4">
      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Backup Section */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
            <ArrowDownTrayIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Export Backup
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Download a complete backup of all user data, series, and settings
            </p>
          </div>
          <button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600 disabled:opacity-50"
          >
            {isBackingUp ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DocumentArrowDownIcon className="h-4 w-4" />
                Export Backup
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
            <ArrowUpTrayIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Import Backup
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Restore data from a backup file (this will overwrite existing
              data)
            </p>
          </div>
          <label className="cursor-pointer rounded-lg bg-yellow-500 px-4 py-2 text-white transition-all hover:bg-yellow-600 disabled:opacity-50">
            {isRestoring ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Restoring...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ArrowUpTrayIcon className="h-4 w-4" />
                Import Backup
              </div>
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
        <div className="mt-3 rounded-md bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          <ExclamationTriangleIcon className="inline h-3 w-3 mr-1" />
          Warning: Restoring will overwrite all existing data. This action
          cannot be undone.
        </div>
      </div>

      {/* Backup Info */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          What&apos;s included in backup:
        </h4>
        <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <li>• All user accounts (names, emails, roles, status)</li>
          <li>• All user series data (watch progress, seasons, posters)</li>
          <li>• Featured series configuration</li>
          <li>• Announcements</li>
        </ul>
      </div>
    </div>
  );
}
