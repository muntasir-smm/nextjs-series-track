// app/ui/announcements.tsx

"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

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
    const saved = localStorage.getItem("dismissedAnnouncements");
    if (saved) {
      setDismissed(new Set(JSON.parse(saved)));
    }

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

  if (isLoading || activeAnnouncements.length === 0) return null;

  const typeStyles: Record<string, string> = {
    info: "border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-950/30",
    success:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30",
    warning:
      "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30",
    error: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30",
  };

  return (
    <div className="mb-6 space-y-2">
      {activeAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={clsx(
            "relative rounded-2xl border p-4",
            typeStyles[announcement.type] || typeStyles.info,
          )}
        >
          <button
            onClick={() => dismiss(announcement.id)}
            className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-400 transition hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
            aria-label="Dismiss announcement"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 pr-7">
            <MegaphoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {announcement.title}
              </h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {announcement.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
