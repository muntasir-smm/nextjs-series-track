// app/ui/tvSeries/add-series-form.tsx

"use client";

import React, { useState } from "react";
import TMDBSeach from "./tmdb-search";

interface AddSeriesFormProps {
  addSeries: (
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[],
  ) => void;
  isSubmitting?: boolean;
}

const AddSeriesForm: React.FC<AddSeriesFormProps> = ({
  addSeries,
  isSubmitting = false,
}) => {
  const [name, setName] = useState("");
  const [totalSeasons, setTotalSeasons] = useState<number | null>(null);
  const [hasUpcoming, setHasUpcoming] = useState<boolean | null>(null);
  const [showTMDB, setShowTMDB] = useState(false);
  const [tmdbData, setTmdbData] = useState<{
    name: string;
    totalSeasons: number;
    posterPath: string | null;
    overview: string;
  } | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    totalSeasons?: string;
    hasUpcoming?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      totalSeasons?: string;
      hasUpcoming?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Series name is required";
    }

    if (totalSeasons === null || totalSeasons < 1) {
      newErrors.totalSeasons =
        "Total seasons is required and must be at least 1";
    }

    if (hasUpcoming === null) {
      newErrors.hasUpcoming = "Please select Yes or No for upcoming season";
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

    if (hasUpcoming === true) {
      const nextSeasonNumber = (totalSeasons as number) + 1;
      upcomingSeasons = [`Season ${nextSeasonNumber}`];
    }

    addSeries(name, totalSeasons as number, upcomingSeasons);

    // Reset form
    setName("");
    setTotalSeasons(null);
    setHasUpcoming(null);
    setTmdbData(null);
    setErrors({});
  };

  const handleTotalSeasonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setTotalSeasons(null);
    } else {
      const numValue = parseInt(value);
      setTotalSeasons(isNaN(numValue) ? null : numValue);
    }
  };

  const handleSelectFromTMDB = (data: {
    name: string;
    totalSeasons: number;
    upcomingSeasons: string[];
    posterPath: string | null;
    overview: string;
  }) => {
    setName(data.name);
    setTotalSeasons(data.totalSeasons > 0 ? data.totalSeasons : null);
    setTmdbData({
      name: data.name,
      totalSeasons: data.totalSeasons,
      posterPath: data.posterPath,
      overview: data.overview,
    });
    setShowTMDB(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TMDB Search Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowTMDB(!showTMDB)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {showTMDB ? "Hide TMDB Search" : "🔍 Search from TMDB"}
        </button>
      </div>

      {/* TMDB Search Component */}
      {showTMDB && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <TMDBSeach
            onSelectSeries={handleSelectFromTMDB}
            onCancel={() => setShowTMDB(false)}
          />
        </div>
      )}

      {/* TMDB Preview */}
      {tmdbData && !showTMDB && (
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            ℹ️ Added from TMDB: {tmdbData.name}
            {tmdbData.overview && (
              <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                {tmdbData.overview.substring(0, 150)}...
              </span>
            )}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Series Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
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
          value={totalSeasons === null ? "" : totalSeasons}
          onChange={handleTotalSeasonsChange}
          disabled={isSubmitting}
          min={1}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Any Upcoming Season? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasUpcoming"
              value="yes"
              checked={hasUpcoming === true}
              onChange={() => setHasUpcoming(true)}
              disabled={isSubmitting}
              className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Yes
            </span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasUpcoming"
              value="no"
              checked={hasUpcoming === false}
              onChange={() => setHasUpcoming(false)}
              disabled={isSubmitting}
              className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
          </label>
        </div>
        {errors.hasUpcoming && (
          <p className="mt-1 text-xs text-red-500">{errors.hasUpcoming}</p>
        )}
        {hasUpcoming === true && !errors.hasUpcoming && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            Season {totalSeasons ? totalSeasons + 1 : "?"} will be added as
            upcoming
          </p>
        )}
        {hasUpcoming === false && !errors.hasUpcoming && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Series will be marked as ended
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Adding..." : "Add Series"}
      </button>
    </form>
  );
};

export default AddSeriesForm;
