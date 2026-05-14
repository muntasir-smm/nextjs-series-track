// app/ui/tvSeries/edit-series-form.tsx

"use client";

import React, { useState } from "react";

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
}

const EditSeriesForm: React.FC<EditSeriesFormProps> = ({
  series,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(series.name);
  const [totalSeasons, setTotalSeasons] = useState<number>(series.totalSeasons);
  const [hasUpcoming, setHasUpcoming] = useState<boolean>(
    series.upcomingSeasons.length > 0,
  );
  const [errors, setErrors] = useState<{
    name?: string;
    totalSeasons?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; totalSeasons?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Series name is required";
    }

    if (totalSeasons < 1) {
      newErrors.totalSeasons = "Total seasons must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let upcomingSeasons: string[] = [];

    if (hasUpcoming) {
      const nextSeasonNumber = totalSeasons + 1;
      upcomingSeasons = [`Season ${nextSeasonNumber}`];
    }

    onSave(series.id, name, totalSeasons, upcomingSeasons);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Series Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
            errors.name
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="Enter series name"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Total Seasons <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={totalSeasons}
          onChange={(e) => setTotalSeasons(parseInt(e.target.value) || 0)}
          min={1}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
            errors.totalSeasons
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="Enter number of seasons"
        />
        {errors.totalSeasons && (
          <p className="mt-1 text-xs text-red-500">{errors.totalSeasons}</p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasUpcoming}
            onChange={(e) => setHasUpcoming(e.target.checked)}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Any Upcoming Season?
          </span>
        </label>
        {hasUpcoming && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            Season {totalSeasons + 1} will be added as upcoming
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditSeriesForm;
