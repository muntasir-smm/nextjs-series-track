// app/ui/dashboard/topnav.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import NavLinks from "@/app/ui/dashboard/nav-links";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

import { signOutAction } from "@/app/lib/signout-action";
import Avatar from "./avatar";
import AddSeriesModal from "./add-series-modal";

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

  useEffect(() => {
    if (user) {
      setUserRole(user.role || "user");
      setUserEmail(user.email || "");
      setUserName(user.name || "My Account");
    }
  }, [user]);

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

  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
      <AddSeriesModal
        isOpen={isAddSeriesModalOpen}
        onClose={() => setIsAddSeriesModalOpen(false)}
        onSeriesAdded={handleSeriesAdded}
      />

      {/* Floating Add Button */}
      {!hideFAB && (
        <button
          onClick={() => setIsAddSeriesModalOpen(true)}
          className={clsx(
            "fixed z-40 flex items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all duration-200",
            "hover:bg-brand-700 hover:shadow-glow active:scale-95",
            "bottom-6 right-6 h-14 w-14 md:bottom-8 md:right-8",
          )}
          aria-label="Add series"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 shrink-0"
            >
              <Image
                src="/images/logo.png"
                alt="Series Tracker"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Series
                <span className="text-brand-600">Tracker</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex md:flex-1 md:justify-center">
              <NavLinks userRole={userRole} seriesCount={seriesCount} />
            </div>

            {/* Desktop Profile */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Avatar src={avatarUrl} name={userName} size="md" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-soft-lg dark:border-slate-700 dark:bg-slate-900 animate-fade-in">
                  <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {userEmail}
                    </p>
                  </div>

                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="h-4 w-4 text-brand-500" />
                      Profile
                    </Link>

                    {userRole === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <ShieldCheckIcon className="h-4 w-4 text-violet-500" />
                        Admin Panel
                      </Link>
                    )}
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile controls */}
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/dashboard/profile">
                <Avatar src={avatarUrl} name={userName} size="sm" />
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 dark:border-slate-800 dark:bg-slate-950 md:hidden animate-slide-up">
            <NavLinks isMobile userRole={userRole} seriesCount={seriesCount} />
            <button
              onClick={handleSignOut}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </header>
    </>
  );
}
