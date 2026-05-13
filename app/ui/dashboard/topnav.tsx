// app/ui/dashboard/topnav.tsx

"use client";

import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { PowerIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import clsx from "clsx";
import { signOutAction } from "@/app/lib/signout-action"; // Import from the new file

export default function TopNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Use the Server Action directly
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

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-white shadow-md dark:bg-gray-900">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Brand */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2 transition-all hover:shadow-lg"
              onClick={closeMobileMenu}
            >
              <span className="text-lg font-bold text-white md:text-xl">
                Series Tracker
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <NavLinks />
              </div>
            </div>

            {/* Desktop Sign Out Button */}
            <div className="hidden md:block">
              <form action={handleSignOut}>
                <button
                  disabled={isSigningOut}
                  className={clsx(
                    "flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium transition-all hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-900/20",
                    {
                      "cursor-not-allowed opacity-50": isSigningOut,
                    },
                  )}
                >
                  <PowerIcon className="h-5 w-5" />
                  <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </form>
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
            {/* Mobile Navigation Links */}
            <div onClick={closeMobileMenu}>
              <NavLinks isMobile={true} />
            </div>

            {/* Mobile Sign Out Button */}
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <form action={handleSignOut}>
                <button
                  disabled={isSigningOut}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium transition-all hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-900/20"
                >
                  <PowerIcon className="h-5 w-5" />
                  <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
}
