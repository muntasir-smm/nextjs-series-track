// app/dashboard/profile/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { getUserSeries } from "@/app/lib/series";
import type { Series } from "@/app/lib/series";
import {
  ShieldCheckIcon,
  HeartIcon,
  UserIcon,
  TvIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { StatsCards } from "./components/stats-cards";
import { ProfileCard } from "./components/ProfileCard";
import { QuickActions } from "./components/QuickActions";
import { ProfileTabContent } from "./components/ProfileTab";
import { SecurityTabContent } from "./components/SecurityTab";
import { PreferencesTabContent } from "./components/PreferencesTab";
import clsx from "clsx";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences"
  >("profile");
  const [seriesData, setSeriesData] = useState<Series[]>([]);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (response.ok) {
          setProfile(data);
          setAvatarUrl(data.avatar_url);
          setTempAvatarUrl(data.avatar_url);
        } else {
          setMessage({
            type: "error",
            text: data.error || "Failed to load profile",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Network error loading profile" });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadUserSeries = async () => {
      try {
        const series = await getUserSeries();
        setSeriesData(series);
      } catch (error) {
        console.error("Error loading user series:", error);
      }
    };
    loadUserSeries();
  }, []);

  const stats = useMemo(() => {
    const totalSeriesWatched = seriesData.length;
    const totalCompletedSeasons = seriesData.reduce(
      (acc, series) => acc + series.watchedSeasons.filter(Boolean).length,
      0,
    );
    const totalEpisodes = seriesData.reduce(
      (acc, series) => acc + (series.totalEpisodes || 0),
      0,
    );
    const totalWatchTimeHours = Math.round((totalEpisodes * 45) / 60);

    let achievements = 0;
    if (totalSeriesWatched >= 1) achievements++;
    if (totalSeriesWatched >= 5) achievements++;
    if (totalSeriesWatched >= 10) achievements++;
    if (totalCompletedSeasons >= 10) achievements++;
    if (totalCompletedSeasons >= 50) achievements++;
    if (totalWatchTimeHours >= 100) achievements++;

    return [
      {
        label: "Series Watched",
        value: totalSeriesWatched.toString(),
        icon: TvIcon,
        color: "from-brand-500 to-cyan-500",
      },
      {
        label: "Completed Seasons",
        value: totalCompletedSeasons.toString(),
        icon: CheckCircleIcon,
        color: "from-emerald-500 to-teal-500",
      },
      {
        label: "Watch Time",
        value: `${totalWatchTimeHours}h`,
        icon: ClockIcon,
        color: "from-violet-500 to-pink-500",
      },
      {
        label: "Achievements",
        value: achievements.toString(),
        icon: TrophyIcon,
        color: "from-amber-500 to-orange-500",
      },
    ];
  }, [seriesData]);

  const handleAvatarChange = (newAvatarUrl: string | null) => {
    setTempAvatarUrl(newAvatarUrl);
  };

  const handleUpdateProfile = async (
    name: string,
    avatarUrlValue: string | null,
  ) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar_url: avatarUrlValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setAvatarUrl(data.user.avatar_url);
        setTempAvatarUrl(data.user.avatar_url);
        setIsEditing(false);
        window.dispatchEvent(new Event("avatar-updated"));
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update profile",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error updating profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMemberDuration = () => {
    if (!profile?.created_at) return "Just joined";
    const created = new Date(profile.created_at);
    const now = new Date();
    const diffYears = now.getFullYear() - created.getFullYear();
    const diffMonths = now.getMonth() - created.getMonth();

    if (diffYears > 0) {
      return `${diffYears} ${diffYears === 1 ? "year" : "years"}`;
    }
    if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? "month" : "months"}`;
    }
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );
    return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <UserIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Profile not found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Please log in again to access your profile.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: UserIcon },
    { id: "security" as const, label: "Security", icon: ShieldCheckIcon },
    { id: "preferences" as const, label: "Preferences", icon: HeartIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Message toast */}
      {message && (
        <div
          className={clsx(
            "rounded-xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
          )}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-3"
        >
          <div className="sticky top-20 space-y-4">
            <ProfileCard
              profile={profile}
              avatarUrl={avatarUrl}
              formatDate={formatDate}
              getMemberDuration={getMemberDuration}
            />
            <QuickActions />
          </div>
        </motion.div>

        {/* Main */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-9"
        >
          {/* Tabs */}
          <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition",
                  activeTab === tab.id
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "profile" && (
            <ProfileTabContent
              profile={profile}
              isEditing={isEditing}
              isSaving={isSaving}
              avatarUrl={avatarUrl}
              tempAvatarUrl={tempAvatarUrl}
              onEdit={() => setIsEditing(true)}
              onCancel={() => {
                setIsEditing(false);
                setTempAvatarUrl(avatarUrl);
              }}
              onSave={handleUpdateProfile}
              onAvatarChange={handleAvatarChange}
              formatDate={formatDate}
              getMemberDuration={getMemberDuration}
            />
          )}

          {activeTab === "security" && <SecurityTabContent />}
          {activeTab === "preferences" && <PreferencesTabContent />}

          {/* Stats */}
          <div className="mt-8">
            <StatsCards stats={stats} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
