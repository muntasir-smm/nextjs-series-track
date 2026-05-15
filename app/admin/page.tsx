// app/admin/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon,
  UsersIcon,
  TvIcon,
} from "@heroicons/react/24/outline";

interface Series {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchedSeasons: boolean[];
  watchProgress: number;
}

export default function AdminPanel() {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    totalSeasons: 1,
    upcomingSeasons: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load series from API
  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/series");
      const data = await response.json();
      setSeries(data);
    } catch (error) {
      console.error("Error loading series:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const upcomingSeasonsArray = formData.upcomingSeasons
      ? [`Season ${formData.upcomingSeasons}`]
      : [];

    const seriesData = {
      id: editingSeries?.id || `series-${Date.now()}`,
      name: formData.name,
      totalSeasons: formData.totalSeasons,
      upcomingSeasons: upcomingSeasonsArray,
      watchedSeasons: Array(formData.totalSeasons).fill(false),
      watchProgress: 0,
    };

    try {
      const response = await fetch("/api/admin/series", {
        method: editingSeries ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seriesData),
      });

      if (response.ok) {
        await loadSeries();
        setIsModalOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save series");
      }
    } catch (error) {
      console.error("Error saving series:", error);
      alert("Failed to save series");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this series? This action cannot be undone.",
      )
    ) {
      try {
        const response = await fetch(`/api/admin/series?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await loadSeries();
        } else {
          alert("Failed to delete series");
        }
      } catch (error) {
        console.error("Error deleting series:", error);
        alert("Failed to delete series");
      }
    }
  };

  const handleEdit = (series: Series) => {
    setEditingSeries(series);
    setFormData({
      name: series.name,
      totalSeasons: series.totalSeasons,
      upcomingSeasons: series.upcomingSeasons[0]?.match(/\d+/)?.[0] || "",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingSeries(null);
    setFormData({
      name: "",
      totalSeasons: 1,
      upcomingSeasons: "",
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading series...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <main>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <TvIcon className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Default Series
                    </h3>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {series.length}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Admin Actions
                    </h3>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    Manage
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Discover Section
                    </h3>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-purple-600">
                    Active
                  </p>
                </div>
              </div>

              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                    Admin Panel
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage default series for the landing page and discover
                    section
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add New Series
                </button>
              </div>

              {/* Series Table */}
              <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Total Seasons
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Upcoming Season
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {series.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {s.id}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {s.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {s.totalSeasons}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {s.upcomingSeasons[0]?.replace("Season", "S") ||
                              "Series Ended"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(s)}
                                className="rounded-lg p-2 text-blue-500 transition-all hover:bg-blue-50 hover:text-blue-600"
                                aria-label="Edit"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="rounded-lg p-2 text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {series.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No series available. Click &ldquo;Add New Series&rdquo; to
                      get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                {editingSeries ? "Edit Series" : "Add New Series"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Series Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Breaking Bad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Seasons *
                  </label>
                  <input
                    type="number"
                    value={formData.totalSeasons}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalSeasons: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upcoming Season (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.upcomingSeasons}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        upcomingSeasons: e.target.value,
                      })
                    }
                    placeholder="e.g., 6 for Season 6"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty if series has ended
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <ArrowPathIcon className="mx-auto h-5 w-5 animate-spin" />
                    ) : editingSeries ? (
                      "Save Changes"
                    ) : (
                      "Add Series"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
