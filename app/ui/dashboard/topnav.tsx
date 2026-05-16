// app/ui/dashboard/topnav.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import NavLinks from "@/app/ui/dashboard/nav-links";
import {
  PowerIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { signOutAction } from "@/app/lib/signout-action";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "./avatar";
import AddSeriesModal from "./add-series-modal";

export default function TopNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isAddSeriesModalOpen, setIsAddSeriesModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  // Load user role and profile
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        setUserRole(session?.user?.role || "user");
      } catch (error) {
        console.error("Error loading user role:", error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        if (response.ok) {
          setAvatarUrl(data.avatar_url);
          setUserName(data.name);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          setAvatarUrl(data.avatar_url);
          setUserName(data.name);
        });
    };

    window.addEventListener("avatar-updated", handleAvatarUpdate);
    return () =>
      window.removeEventListener("avatar-updated", handleAvatarUpdate);
  }, []);

  const handleSeriesAdded = () => {
    // Refresh the page or update the series list
    router.refresh();
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOutAction();
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  // Listen for open-add-modal event
  useEffect(() => {
    const handleOpenModal = () => {
      setIsAddSeriesModalOpen(true);
    };

    window.addEventListener("open-add-modal", handleOpenModal);
    return () => window.removeEventListener("open-add-modal", handleOpenModal);
  }, []);

  return (
    <>
      {/* Add Series Modal */}
      <AddSeriesModal
        isOpen={isAddSeriesModalOpen}
        onClose={() => setIsAddSeriesModalOpen(false)}
        onSeriesAdded={handleSeriesAdded}
      />

      {/* Floating Action Button - Desktop */}
      <button
        onClick={() => setIsAddSeriesModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl md:block"
        aria-label="Add Series"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Floating Action Button - Mobile */}
      <button
        onClick={() => setIsAddSeriesModalOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl md:hidden"
        aria-label="Add Series"
      >
        <PlusIcon className="h-5 w-5" />
      </button>

      <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-md dark:bg-gray-900/95">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Brand */}
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 px-3 py-1.5 transition-all duration-300 hover:shadow-lg hover:scale-105 sm:px-4 sm:py-2"
              onClick={closeMobileMenu}
            >
              <div className="relative h-6 w-6 sm:h-7 sm:w-7">
                <Image
                  src="/images/logo.png"
                  alt="Series Tracker"
                  fill
                  className="object-contain brightness-0 invert"
                  priority
                />
              </div>
              <span className="text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">
                Series Tracker
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                <NavLinks />
              </div>
            </div>

            {/* Desktop User Menu - Profile Dropdown */}
            <div className="hidden md:block" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 rounded-full p-1 text-gray-600 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  aria-label="Profile menu"
                >
                  <Avatar src={avatarUrl} name={userName} size="md" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userName || "My Account"}
                        </p>
                      </div>

                      {/* Profile Link */}
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <UserIcon className="h-4 w-4" />
                        Profile
                      </Link>

                      {/* Admin Panel Link - Only for admins */}
                      {userRole === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-purple-600 transition-colors hover:bg-gray-100 dark:text-purple-400 dark:hover:bg-gray-700"
                        >
                          <ShieldCheckIcon className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                      >
                        <PowerIcon className="h-4 w-4" />
                        {isSigningOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={clsx("md:hidden", {
            block: isMobileMenuOpen,
            hidden: !isMobileMenuOpen,
          })}
        >
          <div className="space-y-1 px-2 pb-3 pt-2">
            <div onClick={closeMobileMenu}>
              <NavLinks isMobile={true} />
            </div>

            {/* Mobile Sign Out Button */}
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-500"
              >
                <PowerIcon className="h-5 w-5" />
                <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
}
