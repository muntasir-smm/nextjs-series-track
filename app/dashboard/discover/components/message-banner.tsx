// app/dashboard/discover/components/message-banner.tsx

"use client";

import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type MessageKind = "success" | "error" | "info";

export interface Message {
  kind: MessageKind;
  text: string;
}

export function MessageBanner({
  message,
  onDismiss,
}: {
  message: Message;
  onDismiss: () => void;
}) {
  const styles: Record<MessageKind, string> = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    error:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
    info: "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  };

  return (
    <div
      role="status"
      className={clsx(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm",
        styles[message.kind],
      )}
    >
      <span>{message.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 opacity-60 transition hover:opacity-100"
        aria-label="Dismiss message"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
