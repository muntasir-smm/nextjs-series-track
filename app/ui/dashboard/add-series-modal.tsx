"use client";

import { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AddSeriesForm from "@/app/ui/tvSeries/add-series-form";
import { addSeries as addSeriesAction } from "@/app/lib/series";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleAddSeries = async (
    tmdbId: number,
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
    posterPath?: string | null,
    backdropPath?: string | null,
    overview?: string | null,
  ) => {
    setIsSubmitting(true);
    setDuplicateError(null);

    try {
      const result = await addSeriesAction(
        tmdbId,
        name,
        totalSeasons,
        upcomingSeasons,
        posterPath,
        backdropPath,
        overview,
      );

      if (result.duplicate) {
        setDuplicateError(
          result.error || `"${name}" is already in your collection`,
        );
        setIsSubmitting(false);
        return;
      }

      if (result.success) {
        window.dispatchEvent(new CustomEvent("series-added"));
        onSeriesAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error adding series:", error);
      setDuplicateError("Failed to add series. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add Series
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Search and select a series to add
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {duplicateError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {duplicateError}
                    </p>
                  </div>
                </div>
              )}

              <AddSeriesForm
                addSeries={handleAddSeries}
                isSubmitting={isSubmitting}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}