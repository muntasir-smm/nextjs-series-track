// app/ui/dashboard/nav-links.tsx

"use client";

import { useEffect, useState } from "react";
import {
  HomeIcon,
  FilmIcon,
  ClockIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  FilmIcon as FilmIconSolid,
  ClockIcon as ClockIconSolid,
  HeartIcon as HeartIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { getUserSeries } from "@/app/lib/series";

const allLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    solidIcon: HomeIconSolid,
    showCount: false,
    description: "Overview and statistics",
  },
  {
    name: "TV Series",
    href: "/dashboard/tvSeries",
    icon: FilmIcon,
    solidIcon: FilmIconSolid,
    showCount: true,
    description: "Manage your collection",
  },
  {
    name: "Discover",
    href: "/dashboard/discover",
    icon: SparklesIcon,
    solidIcon: SparklesIcon,
    showCount: false,
    description: "Find new series to watch",
  },
  {
    name: "Watchlist",
    href: "/dashboard/watchlist",
    icon: ClockIcon,
    solidIcon: ClockIconSolid,
    showCount: true,
    comingSoon: true,
    description: "Plan what to watch next",
  },
  {
    name: "Favorites",
    href: "/dashboard/favorites",
    icon: HeartIcon,
    solidIcon: HeartIconSolid,
    showCount: true,
    comingSoon: true,
    description: "Your favorite series",
  },
  {
    name: "Admin",
    href: "/admin",
    icon: ShieldCheckIcon,
    solidIcon: ShieldCheckIcon,
    adminOnly: true,
    showCount: false,
    description: "Admin panel",
  },
];

interface NavLinksProps {
  isMobile?: boolean;
}

export default function NavLinks({ isMobile = false }: NavLinksProps) {
  const pathname = usePathname();
  const [seriesCount, setSeriesCount] = useState(0);
  const [userRole, setUserRole] = useState<string>("user");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        const role = session?.user?.role || "user";
        // console.log("User role detected:", role);
        setUserRole(role);
      } catch (error) {
        console.error("Error loading user role:", error);
        setUserRole("user");
      } finally {
        setIsLoading(false);
      }
    };
    loadUserRole();
  }, []);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const series = await getUserSeries();
        setSeriesCount(series.length);
      } catch (error) {
        console.error("Error loading series count:", error);
      }
    };
    loadCount();
  }, []);

  // Filter links based on user role
  const links = allLinks.filter(
    (link) => !link.adminOnly || userRole === "admin",
  );

  // console.log("User role for filtering:", userRole);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div
      className={clsx("flex", {
        "flex-row space-x-1": !isMobile,
        "flex-col space-y-1": isMobile,
      })}
    >
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/dashboard" && pathname?.startsWith(link.href));

        const IconComponent =
          isActive && link.solidIcon ? link.solidIcon : link.icon;

        const showBadge =
          link.showCount && link.name === "TV Series" && seriesCount > 0;

        return (
          <div key={link.name} className="relative group">
            <Link
              href={link.comingSoon ? "#" : link.href}
              onClick={(e) => {
                if (link.comingSoon) {
                  e.preventDefault();
                  alert(`${link.name} feature is coming soon! 🚀`);
                }
              }}
              className={clsx(
                "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                {
                  "bg-blue-600 text-white shadow-md":
                    isActive && !link.comingSoon,
                  "text-gray-700 hover:bg-sky-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800":
                    !isActive && !link.comingSoon,
                  "justify-center": !isMobile,
                  "justify-start": isMobile,
                  "opacity-60 cursor-not-allowed": link.comingSoon,
                },
              )}
            >
              <IconComponent className="h-5 w-5" />

              <span
                className={clsx({
                  "hidden lg:inline": !isMobile,
                  inline: isMobile,
                })}
              >
                {link.name}
              </span>

              {showBadge && (
                <span
                  className={clsx(
                    "ml-auto rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white",
                    {
                      "lg:ml-2": !isMobile,
                    },
                  )}
                >
                  {seriesCount}
                </span>
              )}

              {link.comingSoon && (
                <span
                  className={clsx(
                    "ml-2 rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    {
                      "hidden lg:inline-block": !isMobile,
                      "inline-block": isMobile,
                    },
                  )}
                >
                  Soon
                </span>
              )}
            </Link>

            {!isMobile && link.description && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block z-50">
                <div className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap dark:bg-gray-700">
                  {link.description}
                  <div className="absolute left-1/2 -top-1 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
