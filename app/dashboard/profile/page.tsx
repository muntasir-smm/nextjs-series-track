// app/dashboard/profile/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { getUserSeries } from "@/app/lib/series";
import type { Series } from "@/app/lib/series";
import {
  ShieldCheckIcon,
  RocketLaunchIcon,
  BellIcon,
  KeyIcon,
  GlobeAltIcon,
  FingerPrintIcon,
  DeviceTabletIcon,
  HeartIcon,
  UserIcon,
  CheckIcon,
  TvIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { motion, Variants } from "framer-motion";
import Avatar from "@/app/ui/dashboard/avatar";
import { EditProfileForm } from "./components/edit-profile-form";
import { ProfileView } from "./components/profile-view";
import { StatsCards } from "./components/stats-cards";

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

      // In handleUpdateProfile, after successful save:
      if (response.ok) {
        setProfile(data.user);
        setAvatarUrl(data.user.avatar_url);
        setTempAvatarUrl(data.user.avatar_url);
        setIsEditing(false);

        // Dispatch the same event that navbar is listening for
        window.dispatchEvent(new Event("avatar-updated")); // ← Use Event, not CustomEvent

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
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative mb-4 sm:mb-6 lg:mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 lg:p-12">
            <div className="absolute inset-0 bg-[length:30px_30px] sm:bg-[length:60px_60px] bg-[image:repeating-linear-gradient(45deg,white_0px,white_1px,transparent_1px,transparent_30px)] opacity-5" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <RocketLaunchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300 animate-bounce" />
                  <span className="text-xs sm:text-sm font-medium text-blue-100">
                    Welcome back!
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white">
                  Profile Dashboard
                </h1>
                <p className="mt-1 sm:mt-2 text-blue-100 text-sm sm:text-base lg:text-lg">
                  Manage your account and preferences
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
                    />
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-blue-100">
                    Active Session
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-200">
                    Last login: Today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="sticky top-4 sm:top-8 space-y-4 sm:space-y-6">
              {/* Profile Card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="relative h-20 sm:h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="relative group">
                      <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900 p-1 shadow-xl">
                        <Avatar
                          src={tempAvatarUrl || avatarUrl}
                          name={profile.name}
                          size="xl"
                          shape="rounded"
                        />
                      </div>
                      {profile.role === "admin" && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-1 shadow-lg">
                          <ShieldCheckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-12 sm:pt-16 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {profile.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                    {profile.email}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                        profile.role === "admin"
                          ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      <ShieldCheckIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {profile.role === "admin" ? "Admin" : "Member"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      Active
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Member since
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-right">
                      {formatDate(profile.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Member duration
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getMemberDuration()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">
                  Quick Actions
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
                    <BellIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Notification Settings
                  </button>
                  <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
                    <KeyIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Change Password
                  </button>
                  <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
                    <GlobeAltIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Language Preferences
                  </button>
                </div>
              </div>
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

            {/* Profile Tab Content */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        Profile Information
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isEditing
                          ? "Update your personal details"
                          : "View your personal details"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {isEditing ? (
                    <EditProfileForm
                      profile={profile}
                      avatarUrl={tempAvatarUrl} // ← CHANGE: use tempAvatarUrl here
                      onAvatarChange={handleAvatarChange}
                      onSave={handleUpdateProfile}
                      onCancel={() => {
                        setIsEditing(false);
                        setTempAvatarUrl(avatarUrl); // Reset to original on cancel
                      }}
                      isSaving={isSaving}
                    />
                  ) : (
                    <ProfileView
                      profile={profile}
                      onEdit={() => setIsEditing(true)}
                      formatDate={formatDate}
                      getMemberDuration={getMemberDuration}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Security Tab Content */}
            {activeTab === "security" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Security Settings
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account security
                  </p>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300 text-sm sm:text-base">
                          Password Protection
                        </p>
                        <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-all">
                      Change Password
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <DeviceTabletIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Two-Factor Authentication
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                      Enable
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <FingerPrintIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Active Sessions
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Manage devices where you&apos;re logged in
                        </p>
                      </div>
                    </div>
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab Content */}
            {activeTab === "preferences" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Preferences
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Customize your experience
                  </p>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Email Notifications
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Receive updates about your activity
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Language
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Choose your preferred language
                        </p>
                      </div>
                    </div>
                    <select className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option>English</option>
                      <option>বাংলা</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <StatsCards stats={stats} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
