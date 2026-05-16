// app/ui/dashboard/add-series-modal.tsx

"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import AddSeriesForm from "@/app/ui/tvSeries/add-series-form";
import { addSeries as addSeriesAction } from "@/app/lib/series";

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

  const handleAddSeries = async (
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
    posterPath?: string | null,
    backdropPath?: string | null,
    overview?: string | null,
  ) => {
    setIsSubmitting(true);
    try {
      const result = await addSeriesAction(
        name,
        totalSeasons,
        upcomingSeasons,
        posterPath,
        backdropPath,
        overview,
      );
      if (result.success) {
        window.dispatchEvent(new CustomEvent("series-added"));
        onSeriesAdded();
        onClose();
      } else {
        console.error("Failed to add series:", result.error);
      }
    } catch (error) {
      console.error("Error adding series:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Add New Series
          </h2>
          <AddSeriesForm
            addSeries={handleAddSeries}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
