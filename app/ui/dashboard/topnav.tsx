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
  ChevronDownIcon,
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
  const [userEmail, setUserEmail] = useState<string>(""); // Added for the design
  const [isAddSeriesModalOpen, setIsAddSeriesModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Hide FAB on Discover page
  const hideFAB = pathname === "/dashboard/discover";

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

  // Load user session (role, email, maybe basic profile info)
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        if (response.ok) {
          setUserRole(session?.user?.role || "user");
          setUserEmail(session?.user?.email || "");
          // Initialize userName with email or some placeholder, can be updated by loadProfile
          setUserName(session?.user?.name || "My Account");
        }
      } catch (error) {
        console.error("Error loading user role:", error);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        if (response.ok) {
          setAvatarUrl(data.avatar_url);
          setUserName(data.name);
          // If userName from profile is more accurate, it's already set
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

      {/* Floating Action Button - Hidden on Discover page */}
      {!hideFAB && (
        <>
          {/* Desktop */}
          <button
            onClick={() => setIsAddSeriesModalOpen(true)}
            className="fixed bottom-6 right-6 z-40 hidden rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl md:block"
            aria-label="Add Series"
          >
            <PlusIcon className="h-6 w-6" />
          </button>

          {/* Mobile */}
          <button
            onClick={() => setIsAddSeriesModalOpen(true)}
            className="fixed bottom-4 right-4 z-40 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl md:hidden"
            aria-label="Add Series"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Top Navbar with frosted glass effect */}
      <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-md dark:bg-gray-900/95">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Brand */}
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-full p-1.5 transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              onClick={closeMobileMenu}
            >
              <div className="relative h-6 w-6 sm:h-7 sm:w-7">
                <Image
                  src="/images/logo.png"
                  alt="Series Tracker Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {/* BRAND TEXT with blue "Tracker" */}
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
                Series
                <span className="text-blue-600 dark:text-blue-500">
                  Tracker
                </span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <NavLinks userRole={userRole} />
            </div>

            {/* Desktop User Menu - Compact Dropdown */}
            <div className="hidden md:block" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 rounded-full p-1 text-gray-600 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  aria-label="Profile menu"
                >
                  <Avatar src={avatarUrl} name={userName} size="md" />
                  <ChevronDownIcon
                    className={clsx(
                      "h-4 w-4 transition-transform duration-200",
                      {
                        "rotate-180": isProfileOpen,
                      },
                    )}
                  />
                </button>

                {/* Dropdown Menu - Card Design */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                    {/* User Info - Prominent Header */}
                    <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-700">
                      <Avatar src={avatarUrl} name={userName} size="xl" />
                      <div>
                        <p className="text-base font-bold text-gray-950 dark:text-white">
                          {userName || "John Doe"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {userEmail || "you@email.com"}
                        </p>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      {/* Profile Link */}
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <UserIcon className="h-4 w-4 text-blue-500" />
                        Profile
                      </Link>

                      {/* Admin Panel Link - Distinct Admin badge/icon */}
                      {userRole === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <ShieldCheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="flex-1">Admin Panel</span>
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            ADMIN
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Sign Out - Red Button Design */}
                    <div className="pt-2">
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
                      >
                        <PowerIcon className="h-5 w-5" />
                        {isSigningOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button and avatar */}
            <div className="flex items-center gap-2 md:hidden">
              <Avatar src={avatarUrl} name={userName} size="sm" />
              <button
                onClick={toggleMobileMenu}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
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
        </div>

        {/* Mobile menu dropdown */}
        <div
          className={clsx("md:hidden", {
            block: isMobileMenuOpen,
            hidden: !isMobileMenuOpen,
          })}
        >
          <div className="space-y-1.5 px-3.5 pb-4 pt-3">
            <NavLinks isMobile userRole={userRole} />

            {/* Mobile Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-70"
            >
              <PowerIcon className="h-5 w-5" />
              <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
}
