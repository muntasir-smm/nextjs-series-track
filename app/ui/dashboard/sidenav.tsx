// app/ui/dashboard/sidenav.tsx

"use client";

import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { PowerIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export default function SideNav() {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { signOut } = await import("@/auth");
      await signOut({ redirectTo: "/login" });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      {/* Logo/Brand Link */}
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-gradient-to-br from-blue-500 to-blue-600 p-4 transition-all hover:shadow-lg md:h-40"
        href="/dashboard"
      >
        <div className="flex flex-col text-white">
          <span className="text-xl font-bold md:text-2xl">Series Tracker</span>
          {/* <span className="hidden text-xs opacity-90 md:block">Dashboard</span> */}
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />

        {/* Spacer */}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

        {/* Sign Out Button */}
        <form action={handleSignOut}>
          <button
            disabled={isSigningOut}
            className={clsx(
              "flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium transition-all hover:bg-red-50 hover:text-red-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "cursor-not-allowed opacity-50": isSigningOut,
                "hover:bg-red-50 hover:text-red-600": !isSigningOut,
              },
            )}
          >
            <PowerIcon className="w-6" />
            <div className="hidden md:block">
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
