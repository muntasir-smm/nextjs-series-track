// app/ui/announcements.tsx

"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, MegaphoneIcon } from "@heroicons/react/24/outline";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load dismissed from localStorage
    const saved = localStorage.getItem("dismissedAnnouncements");
    if (saved) {
      setDismissed(new Set(JSON.parse(saved)));
    }

    // Fetch active announcements
    fetch("/api/announcements/active")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching announcements:", error);
        setIsLoading(false);
      });
  }, []);

  const dismiss = (id: number) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(id);
    setDismissed(newDismissed);
    localStorage.setItem(
      "dismissedAnnouncements",
      JSON.stringify([...newDismissed]),
    );
  };

  const activeAnnouncements = announcements.filter((a) => !dismissed.has(a.id));

  if (isLoading) return null;
  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {activeAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`relative rounded-lg border p-4 ${
            announcement.type === "info"
              ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
              : announcement.type === "success"
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                : announcement.type === "warning"
                  ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          }`}
        >
          <button
            onClick={() => dismiss(announcement.id)}
            className="absolute right-2 top-2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
            aria-label="Dismiss announcement"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-2 pr-6">
            <MegaphoneIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {announcement.title}
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {announcement.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
