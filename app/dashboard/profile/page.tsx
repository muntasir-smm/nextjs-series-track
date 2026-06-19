// app/dashboard/profile/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { getUserSeries } from "@/app/lib/series";
import type { Series } from "@/app/lib/series";
import {
  ShieldCheckIcon,
  BellIcon,
  KeyIcon,
  GlobeAltIcon,
  HeartIcon,
  UserIcon,
  TvIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { motion, Variants } from "framer-motion";
import { StatsCards } from "./components/stats-cards";
import { ProfileCard } from "./components/ProfileCard";
import { QuickActions } from "./components/QuickActions";
import { ProfileTabContent } from "./components/ProfileTab";
import { SecurityTabContent } from "./components/SecurityTab";
import { PreferencesTabContent } from "./components/PreferencesTab";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

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

  // Load user profile
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
      } catch (error) {
        setMessage({ type: "error", text: "Network error loading profile" });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Load user series data for stats
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

  // Calculate dynamic stats from actual user data

  const stats = useMemo(() => {
    const totalSeriesWatched = seriesData.length;
    const totalCompletedSeasons = seriesData.reduce((acc, series) => {
      return acc + series.watchedSeasons.filter(Boolean).length;
    }, 0);
    const totalEpisodes = seriesData.reduce((acc, series) => {
      return acc + (series.totalEpisodes || 0);
    }, 0);
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
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: "Completed Seasons",
        value: totalCompletedSeasons.toString(),
        icon: CheckCircleIcon,
        color: "from-green-500 to-emerald-500",
      },
      {
        label: "Watch Time",
        value: `${totalWatchTimeHours}h`,
        icon: ClockIcon,
        color: "from-purple-500 to-pink-500",
      },
      {
        label: "Achievements",
        value: achievements.toString(),
        icon: TrophyIcon,
        color: "from-amber-500 to-orange-500",
      },
    ];
  }, [seriesData]);

  // Handle avatar change (temporary, not saved yet)
  const handleAvatarChange = (newAvatarUrl: string | null) => {
    setTempAvatarUrl(newAvatarUrl);
  };

  // Handle profile save with both name and avatar
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

        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Error:", error);
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
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? "month" : "months"}`;
    } else {
      const diffDays = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
      );
      return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[600px] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4 sm:mb-6">
            <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile not found
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Please log in again to access your profile.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="sticky top-4 sm:top-8 space-y-4 sm:space-y-6">
              <ProfileCard
                profile={profile}
                avatarUrl={avatarUrl}
                formatDate={formatDate}
                getMemberDuration={getMemberDuration}
              />
              <QuickActions />
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-9"
          >
            {/* Tabs */}
            <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-px">
              {[
                { id: "profile", label: "Profile", icon: UserIcon },
                { id: "security", label: "Security", icon: ShieldCheckIcon },
                { id: "preferences", label: "Preferences", icon: HeartIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
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

            {/* Stats Cards */}
            <StatsCards stats={stats} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
