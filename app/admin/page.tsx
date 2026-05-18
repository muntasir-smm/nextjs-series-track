// app/admin/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UsersIcon,
  TvIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  UserGroupIcon,
  CloudIcon,
  EyeIcon,
  TrashIcon,
  StarIcon,
  ArrowDownTrayIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import StatCard from "./components/StatCard";
import UserTable from "./components/UserTable";
import FeaturedSeries from "./components/FeaturedSeries";
import Announcements from "./components/Announcements";
import BackupRestore from "./components/BackupRestore";
import SystemHealth from "./components/SystemHealth";

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalSeries: number;
  mostTrackedSeries: Array<{ name: string; count: number }>;
  popularGenres: Array<{ genre: string; count: number }>;
  averageProgress: number;
  newUsersThisMonth: number;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      console.log("Loading users...");
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      console.log("Users response:", data);

      // Handle both response formats
      const usersList = data.users || (Array.isArray(data) ? data : []);
      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadAnalytics(), loadUsers()]).finally(() =>
      setIsLoading(false),
    );
  }, [loadAnalytics, loadUsers]);

  const handleUpdateUser = async (
    userId: string,
    action: string,
    data?: any,
  ) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, data }),
      });
      if (response.ok) {
        await loadUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-7 w-7 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage users, monitor system, and control content
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 dark:border-gray-700 flex-wrap">
        {[
          { id: "overview", label: "Overview", icon: ChartBarIcon },
          { id: "users", label: "User Management", icon: UsersIcon },
          { id: "featured", label: "Featured Series", icon: StarIcon },
          { id: "announcements", label: "Announcements", icon: MegaphoneIcon },
          { id: "health", label: "System Health", icon: HeartIcon },
          { id: "backup", label: "Backup", icon: ArrowDownTrayIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>
      {/* Overview Tab */}
      {activeTab === "overview" && analytics && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={analytics.totalUsers}
              icon={<UsersIcon className="h-6 w-6" />}
              color="blue"
            />
            <StatCard
              title="Active Users (7d)"
              value={analytics.activeUsers}
              icon={<UserGroupIcon className="h-6 w-6" />}
              color="green"
            />
            <StatCard
              title="Total Series Tracked"
              value={analytics.totalSeries}
              icon={<TvIcon className="h-6 w-6" />}
              color="purple"
            />
            <StatCard
              title="Avg Watch Progress"
              value={`${analytics.averageProgress}%`}
              icon={<ChartBarIcon className="h-6 w-6" />}
              color="orange"
            />
          </div>

          {/* Most Tracked Series */}
          <div className="rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Most Tracked Series
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {analytics.mostTrackedSeries.slice(0, 5).map((series, index) => (
                <div
                  key={series.name}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {series.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {series.count} users
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Genres */}
          <div className="rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Popular Genres
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {analytics.popularGenres.map((genre) => (
                <span
                  key={genre.genre}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {genre.genre} ({genre.count})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View, manage, and moderate user accounts
            </p>
          </div>
          <div className="p-4">
            <UserTable users={users} onUpdateUser={handleUpdateUser} />
          </div>
        </div>
      )}
      {/* featured */}
      {activeTab === "featured" && (
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="p-4">
            <FeaturedSeries />
          </div>
        </div>
      )}
      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="p-4">
            <Announcements />
          </div>
        </div>
      )}
      {/* System Health Tab */}
      {activeTab === "health" && (
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="p-4">
            <SystemHealth />
          </div>
        </div>
      )}
      {/* Backup Tab */}
      {activeTab === "backup" && (
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Backup & Restore
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Export or import your data
            </p>
          </div>
          <div className="p-4">
            <BackupRestore />
          </div>
        </div>
      )}
    </div>
  );
}
