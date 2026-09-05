// app/admin/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UsersIcon,
  TvIcon,
  ChartBarIcon,
  MegaphoneIcon,
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
import clsx from "clsx";

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
        }
        return {
          success: false,
          message: result.error || "Operation failed",
        };
      } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, message: "Network error. Please try again." };
      }
    },
    [loadUsers],
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: HomeIcon },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "featured", label: "Featured", icon: StarIcon },
    { id: "announcements", label: "Announcements", icon: MegaphoneIcon },
    { id: "health", label: "Health", icon: HeartIcon },
    { id: "backup", label: "Backup", icon: ArrowDownTrayIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {/* Overview */}
        {activeTab === "overview" && analytics && (
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Most Tracked */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-brand-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Most Tracked Series
                  </h2>
                </div>
                <div className="space-y-2">
                  {analytics.mostTrackedSeries
                    .slice(0, 5)
                    .map((series, index) => (
                      <div
                        key={series.name}
                        className="flex items-center justify-between rounded-xl bg-white p-3 dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={clsx(
                              "text-sm font-bold",
                              index === 0
                                ? "text-amber-500"
                                : index === 1
                                  ? "text-slate-400"
                                  : index === 2
                                    ? "text-orange-500"
                                    : "text-slate-400",
                            )}
                          >
                            #{index + 1}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {series.name}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500">
                          {series.count} users
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Genres */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-violet-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Popular Genres
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.popularGenres.map((genre) => (
                    <span
                      key={genre.genre}
                      className="rounded-full bg-gradient-to-r from-brand-500 to-violet-500 px-3 py-1 text-sm font-medium text-white shadow-sm"
                    >
                      {genre.genre} ({genre.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <UserPlusIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    New This Month
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {analytics.newUsersThisMonth}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
                <CalendarIcon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Active Rate
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {analytics.totalUsers > 0
                      ? Math.round(
                          (analytics.activeUsers / analytics.totalUsers) * 100,
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="p-6">
            <UserTable
              users={users}
              onUpdateUser={handleUpdateUser}
              onRefresh={loadUsers}
            />
          </div>
        )}

        {activeTab === "featured" && (
          <div className="p-6">
            <FeaturedSeries />
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="p-6">
            <Announcements />
          </div>
        )}

        {activeTab === "health" && (
          <div className="p-6">
            <SystemHealth />
          </div>
        )}

        {activeTab === "backup" && (
          <div className="p-6">
            <BackupRestore />
          </div>
        )}
      </div>
    </div>
  );
}
