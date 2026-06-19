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
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

import { signOutAction } from "@/app/lib/signout-action";
import Avatar from "./avatar";
import AddSeriesModal from "./add-series-modal";

/* =========================
   TYPES (FIX FOR TS ERROR)
========================= */

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  is_banned?: boolean;
  is_active?: boolean;
  is_approved?: boolean;
};

type TopNavProps = {
  user?: SessionUser;
  seriesCount?: number;
};

export default function TopNav({ user, seriesCount }: TopNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [userRole, setUserRole] = useState("user");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState("My Account");
  const [userEmail, setUserEmail] = useState("");

  const [isAddSeriesModalOpen, setIsAddSeriesModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const hideFAB = pathname === "/dashboard/discover";

  /* =========================
     INIT FROM SERVER USER (FIX)
  ========================= */
  useEffect(() => {
    if (user) {
      setUserRole(user.role || "user");
      setUserEmail(user.email || "");
      setUserName(user.name || "My Account");
    }
  }, [user]);

  /* =========================
     SESSION LOAD (fallback)
  ========================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await res.json();

        if (!mounted || !res.ok) return;

        const u = session?.user;

        setUserRole(u?.role || "user");
        setUserEmail(u?.email || "");
        setUserName(u?.name || "My Account");
      } catch {
        setUserRole("user");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     PROFILE LOAD
  ========================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();

        if (!mounted || !res.ok) return;

        setAvatarUrl(data.avatar_url || null);
        setUserName(data.name || "My Account");
      } catch {}
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     OUTSIDE CLICK CLOSE
  ========================= */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => setIsProfileOpen(false), [pathname]);

  /* =========================
     ACTIONS
  ========================= */
  const toggleMobileMenu = useCallback(
    () => setIsMobileMenuOpen((p) => !p),
    [],
  );

  const toggleProfile = useCallback(() => setIsProfileOpen((p) => !p), []);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await signOutAction();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSeriesAdded = () => router.refresh();

  return (
    <>
      {/* MODAL */}
      <AddSeriesModal
        isOpen={isAddSeriesModalOpen}
        onClose={() => setIsAddSeriesModalOpen(false)}
        onSeriesAdded={handleSeriesAdded}
      />

      {/* FLOATING ACTION BUTTON */}
      {!hideFAB && (
        <>
          <button
            onClick={() => setIsAddSeriesModalOpen(true)}
            className="fixed bottom-6 right-6 z-40 hidden md:block rounded-full bg-blue-600 hover:bg-blue-700 p-4 text-white shadow-lg transition"
          >
            <PlusIcon className="h-6 w-6" />
          </button>

          <button
            onClick={() => setIsAddSeriesModalOpen(true)}
            className="fixed bottom-4 right-4 z-40 md:hidden rounded-full bg-blue-600 hover:bg-blue-700 p-3 text-white shadow-lg transition"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-colors">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex h-16 items-center justify-between">
            {/* LOGO */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-900 dark:text-white"
            >
              <Image src="/images/logo.png" alt="logo" width={28} height={28} />
              <span className="text-xl font-extrabold">
                Series<span className="text-blue-600">Tracker</span>
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:block">
              <NavLinks userRole={userRole} seriesCount={seriesCount} />
            </div>

            {/* PROFILE */}
            <div className="hidden md:block" ref={dropdownRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 rounded-full p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Avatar src={avatarUrl} name={userName} size="md" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-3 mt-3 w-64 rounded-2xl p-2 shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                  {/* HEADER */}
                  <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="w-full text-center space-y-0.5 min-w-0">
                      <p className="font-semibold text-base text-gray-900 dark:text-white truncate">
                        {userName}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  {/* LINKS */}
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 p-2 rounded-lg mt-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <UserIcon className="h-4 w-4 text-blue-500" />
                    Profile
                  </Link>

                  {userRole === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ShieldCheckIcon className="h-4 w-4 text-purple-500" />
                      Admin Panel
                    </Link>
                  )}

                  {/* SIGN OUT */}
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full mt-3 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition"
                  >
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 p-2 rounded-lg mt-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Avatar src={avatarUrl} name={userName} size="sm" />
              </Link>

              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 dark:text-gray-300"
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

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 border-t border-gray-200 dark:border-gray-800">
            <NavLinks isMobile userRole={userRole} seriesCount={seriesCount} />

            <button
              onClick={handleSignOut}
              className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>

      <div className="h-16" />
    </>
  );
}
