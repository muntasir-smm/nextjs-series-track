// app/ui/dashboard/add-series-modal.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AddSeriesForm from "@/app/ui/tvSeries/add-series-form";
import { motion, AnimatePresence } from "framer-motion";

interface AddSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeriesAdded: () => void;
}

export default function AddSeriesModal({
  isOpen,
  onClose,
  onSeriesAdded,
}: AddSeriesModalProps) {
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setDuplicateError(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSuccess = () => {
    window.dispatchEvent(new CustomEvent("series-added"));
    onSeriesAdded();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 flex w-full max-w-lg max-h-[min(90vh,40rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Header */}
            <div className="grid grid-cols-12 items-center justify-between border-b border-slate-100 p-2 dark:border-slate-800">
              <div className="col-span-11 text-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add to library
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Search and add a movie or TV series
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="col-span-1 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Body — scrolls if needed; results list is in-flow */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
              {duplicateError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                  <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {duplicateError}
                  </p>
                </div>
              )}

              <AddSeriesForm
                onSuccess={handleSuccess}
                onCancel={onClose}
                onError={(msg) => setDuplicateError(msg)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
