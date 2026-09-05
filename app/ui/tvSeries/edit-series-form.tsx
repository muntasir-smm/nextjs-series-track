// app/ui/tvSeries/edit-series-form.tsx

"use client";

import React, { useState } from "react";
import clsx from "clsx";

interface EditSeriesFormProps {
  series: {
    id: string;
    name: string;
    totalSeasons: number;
    upcomingSeasons: string[];
  };
  onSave: (
    id: string,
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
  ) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const inputBase =
  "mt-1.5 block w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-white";

const EditSeriesForm: React.FC<EditSeriesFormProps> = ({
  series,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(series.name);
  const [totalSeasons, setTotalSeasons] = useState<number>(series.totalSeasons);
  const [hasUpcoming, setHasUpcoming] = useState<boolean | null>(
    series.upcomingSeasons.length > 0,
  );
  const [errors, setErrors] = useState<{
    name?: string;
    totalSeasons?: string;
    hasUpcoming?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "Series name is required";
    if (totalSeasons < 1)
      newErrors.totalSeasons = "Total seasons must be at least 1";
    if (hasUpcoming === null)
      newErrors.hasUpcoming = "Please select Yes or No for upcoming season";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let upcomingSeasons: string[] = [];
    if (hasUpcoming === true) {
      upcomingSeasons = [`Season ${totalSeasons + 1}`];
    }

    onSave(series.id, name, totalSeasons, upcomingSeasons);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Series Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          placeholder="Enter series name"
          className={clsx(
            inputBase,
            errors.name
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600",
          )}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Total Seasons */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Total Seasons <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={totalSeasons}
          onChange={(e) => setTotalSeasons(parseInt(e.target.value) || 0)}
          disabled={isSubmitting}
          min={1}
          placeholder="Enter number of seasons"
          className={clsx(
            inputBase,
            errors.totalSeasons
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600",
          )}
        />
        {errors.totalSeasons && (
          <p className="mt-1.5 text-xs text-red-500">{errors.totalSeasons}</p>
        )}
      </div>

      {/* Upcoming */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Any Upcoming Season? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-5">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="hasUpcoming"
              value="yes"
              checked={hasUpcoming === true}
              onChange={() => setHasUpcoming(true)}
              disabled={isSubmitting}
              className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Yes
            </span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="hasUpcoming"
              value="no"
              checked={hasUpcoming === false}
              onChange={() => setHasUpcoming(false)}
              disabled={isSubmitting}
              className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              No
            </span>
          </label>
        </div>
        {errors.hasUpcoming && (
          <p className="mt-1.5 text-xs text-red-500">{errors.hasUpcoming}</p>
        )}
        {hasUpcoming === true && !errors.hasUpcoming && (
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
            Season {totalSeasons + 1} will be added as upcoming
          </p>
        )}
        {hasUpcoming === false && !errors.hasUpcoming && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Series will be marked as ended
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditSeriesForm;
