// app/admin/components/Announcements.tsx

"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  created_at: string;
  creator_name: string;
  expires_at: string | null;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    expiresAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await fetch("/api/admin/announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadAnnouncements();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });

      if (response.ok) {
        await loadAnnouncements();
      }
    } catch (error) {
      console.error("Error toggling announcement:", error);
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadAnnouncements();
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      message: "",
      type: "info",
      expiresAt: "",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20";
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
      default:
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading announcements...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Announcements
          </h3>
          <p className="text-sm text-gray-500">Send messages to all users</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
        >
          <PlusIcon className="h-4 w-4" />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
          <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No announcements yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Create your first announcement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-lg border p-4 transition-all ${getTypeStyles(announcement.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(announcement.type)}
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h4>
                    {!announcement.is_active && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {announcement.message}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>By: {announcement.creator_name}</span>
                    <span>•</span>
                    <span>
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                    {announcement.expires_at && (
                      <>
                        <span>•</span>
                        <span>
                          Expires:{" "}
                          {new Date(
                            announcement.expires_at,
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      toggleStatus(announcement.id, announcement.is_active)
                    }
                    className={`rounded-lg p-1.5 transition-all ${
                      announcement.is_active
                        ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        : "text-green-500 hover:bg-green-50"
                    }`}
                    title={announcement.is_active ? "Deactivate" : "Activate"}
                  >
                    {announcement.is_active ? (
                      <XMarkIcon className="h-4 w-4" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Announcement title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Your announcement message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expires At (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Announcement"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
