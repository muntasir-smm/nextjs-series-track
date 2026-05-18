// app/admin/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UsersIcon,
  TvIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  StarIcon,
  ArrowDownTrayIcon,
  HeartIcon,
  HomeIcon,
  UserPlusIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
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
      const response = await fetch("/api/admin/users");
      const data = await response.json();
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

  const handleUpdateUser = useCallback(
    async (
      userId: string,
      action: string,
      data?: any,
    ): Promise<{ success: boolean; message?: string }> => {
      try {
        const response = await fetch("/api/admin/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action, data }),
        });

        const result = await response.json();

        if (response.ok) {
          await loadUsers();
          return { success: true, message: result.message };
        } else {
          return {
            success: false,
            message: result.error || "Operation failed",
          };
        }
      } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, message: "Network error. Please try again." };
      }
    },
    [loadUsers],
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: HomeIcon, color: "blue" },
    { id: "users", label: "Users", icon: UsersIcon, color: "green" },
    { id: "featured", label: "Featured", icon: StarIcon, color: "yellow" },
    {
      id: "announcements",
      label: "Announcements",
      icon: MegaphoneIcon,
      color: "purple",
    },
    { id: "health", label: "Health", icon: HeartIcon, color: "red" },
    { id: "backup", label: "Backup", icon: ArrowDownTrayIcon, color: "gray" },
  ];

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
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
            <ShieldCheckIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Admin Panel</h1>
            <p className="mt-1 text-sm text-white/80">
              Manage users, monitor system, and control content
            </p>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const colorClasses = {
            blue: isActive
              ? "bg-blue-500 text-white"
              : "hover:bg-blue-50 hover:text-blue-600",
            green: isActive
              ? "bg-green-500 text-white"
              : "hover:bg-green-50 hover:text-green-600",
            yellow: isActive
              ? "bg-yellow-500 text-white"
              : "hover:bg-yellow-50 hover:text-yellow-600",
            purple: isActive
              ? "bg-purple-500 text-white"
              : "hover:bg-purple-50 hover:text-purple-600",
            red: isActive
              ? "bg-red-500 text-white"
              : "hover:bg-red-50 hover:text-red-600",
            gray: isActive
              ? "bg-gray-500 text-white"
              : "hover:bg-gray-100 hover:text-gray-600",
          };

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? `${colorClasses[tab.color as keyof typeof colorClasses]} shadow-md`
                  : `${colorClasses[tab.color as keyof typeof colorClasses]} text-gray-600 dark:text-gray-400`
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area with Card Style */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Overview Tab */}
        {activeTab === "overview" && analytics && (
          <div className="p-6">
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

            {/* Charts Section */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Most Tracked Series */}
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Most Tracked Series
                  </h2>
                </div>
                <div className="space-y-2">
                  {analytics.mostTrackedSeries
                    .slice(0, 5)
                    .map((series, index) => (
                      <div
                        key={series.name}
                        className="flex items-center justify-between rounded-md bg-white p-3 dark:bg-gray-900"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-lg font-bold ${
                              index === 0
                                ? "text-yellow-500"
                                : index === 1
                                  ? "text-gray-400"
                                  : index === 2
                                    ? "text-orange-500"
                                    : "text-gray-400"
                            }`}
                          >
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
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <StarIcon className="h-5 w-5 text-purple-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Popular Genres
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.popularGenres.map((genre) => (
                    <span
                      key={genre.genre}
                      className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-sm font-medium text-white shadow-sm"
                    >
                      {genre.genre} ({genre.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-green-50 to-teal-50 p-4 dark:from-green-900/20 dark:to-teal-900/20">
                <UserPlusIcon className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    New This Month
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.newUsersThisMonth}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(
                      (analytics.activeUsers / analytics.totalUsers) * 100,
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="p-6">
            <UserTable
              users={users}
              onUpdateUser={handleUpdateUser}
              onRefresh={loadUsers}
            />
          </div>
        )}

        {/* Featured Tab */}
        {activeTab === "featured" && (
          <div className="p-6">
            <FeaturedSeries />
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="p-6">
            <Announcements />
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === "health" && (
          <div className="p-6">
            <SystemHealth />
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === "backup" && (
          <div className="p-6">
            <BackupRestore />
          </div>
        )}
      </div>
    </div>
  );
}
