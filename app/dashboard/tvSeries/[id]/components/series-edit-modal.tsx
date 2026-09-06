// app/dashboard/tvSeries/[id]/components/series-edit-modal.tsx

"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import EditSeriesForm from "@/app/ui/tvSeries/edit-series-form";
import type { Series } from "@/app/lib/series";

interface Props {
  open: boolean;
  series: Series;
  onClose: () => void;
  onSave: (
    id: string,
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
  ) => Promise<void>;
}

export function SeriesEditModal({ open, series, onClose, onSave }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
                Edit series
              </h2>
              <EditSeriesForm
                series={series}
                onSave={onSave}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
