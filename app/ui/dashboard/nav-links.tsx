// app/ui/dashboard/nav-links.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import {
  HomeIcon,
  FilmIcon,
  ClockIcon,
  HeartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  FilmIcon as FilmIconSolid,
  ClockIcon as ClockIconSolid,
  HeartIcon as HeartIconSolid,
  SparklesIcon as SparklesIconSolid,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { getUserSeries } from "@/app/lib/series";

interface LinkItem {
  name: string;
  href?: string;
  icon: any;
  solidIcon?: any;
  showCount?: boolean;
  description?: string;
  adminOnly?: boolean;
  comingSoon?: boolean;
  isDropdown?: boolean;
  dropdownItems?: LinkItem[];
}

// Desktop navigation
const desktopLinks: LinkItem[] = [
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
    solidIcon: SparklesIconSolid,
    showCount: false,
    description: "Find new series to watch",
  },
  {
    name: "Coming Soon",
    icon: ClockIcon,
    isDropdown: true,
    dropdownItems: [
      {
        name: "Watchlist",
        href: "/dashboard/watchlist",
        icon: ClockIcon,
        comingSoon: true,
        description: "Plan what to watch next",
      },
      {
        name: "Favorites",
        href: "/dashboard/favorites",
        icon: HeartIcon,
        comingSoon: true,
        description: "Your favorite series",
      },
    ],
  },
];

// Full navigation for mobile menu
const allLinks: LinkItem[] = [
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
    solidIcon: SparklesIconSolid,
    showCount: false,
    description: "Find new series to watch",
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: UserIcon,
    solidIcon: UserIcon,
    showCount: false,
    description: "View and edit your profile",
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

// Dropdown Component with click-outside handling
function DropdownMenu({
  link,
  isActive,
}: {
  link: LinkItem;
  isActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname(); // Moved here to fix the hook warning

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change - fixed dependency
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={clsx(
          "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
          {
            "bg-blue-600 text-white shadow-md": isActive,
            "text-gray-700 hover:bg-sky-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800":
              !isActive,
          },
        )}
      >
        <link.icon className="h-5 w-5" />
        <span className="hidden lg:inline">{link.name}</span>
        <ChevronDownIcon
          className={clsx("h-4 w-4 transition-transform duration-200", {
            "rotate-180": isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 z-50">
          <div className="py-1">
            {link.dropdownItems?.map((item) => (
              <Link
                key={item.name}
                href={item.comingSoon ? "#" : item.href || "#"}
                onClick={(e) => {
                  if (item.comingSoon) {
                    e.preventDefault();
                    alert(`${item.name} feature is coming soon! 🚀`);
                  }
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {item.comingSoon && (
                  <span className="ml-auto rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

  // For mobile, show all links (no dropdown)
  if (isMobile) {
    const mobileLinks = allLinks.filter(
      (link) => !link.adminOnly || userRole === "admin",
    );

    return (
      <div className="flex flex-col space-y-1">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href;
          const IconComponent = link.icon;
          const showBadge =
            link.showCount && link.name === "TV Series" && seriesCount > 0;

          return (
            <Link
              key={link.name}
              href={link.comingSoon ? "#" : link.href || "#"}
              onClick={(e) => {
                if (link.comingSoon) {
                  e.preventDefault();
                  alert(`${link.name} feature is coming soon! 🚀`);
                }
              }}
              className={clsx(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                {
                  "bg-blue-600 text-white shadow-md":
                    isActive && !link.comingSoon,
                  "text-gray-700 hover:bg-sky-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800":
                    !isActive && !link.comingSoon,
                  "opacity-60 cursor-not-allowed": link.comingSoon,
                },
              )}
            >
              <IconComponent className="h-5 w-5" />
              <span className="flex-1">{link.name}</span>
              {showBadge && (
                <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {seriesCount}
                </span>
              )}
              {link.comingSoon && (
                <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  // For desktop, render with dropdown
  return (
    <div className="flex flex-row space-x-1">
      {desktopLinks.map((link) => {
        if (link.isDropdown) {
          return <DropdownMenu key={link.name} link={link} isActive={false} />;
        }

        const isActive = pathname === link.href;
        const IconComponent = link.icon;
        const SolidIcon = link.solidIcon;
        const FinalIcon = isActive && SolidIcon ? SolidIcon : IconComponent;
        const showBadge =
          link.showCount && link.name === "TV Series" && seriesCount > 0;

        return (
          <div key={link.name} className="relative group">
            <Link
              href={link.href || "#"}
              className={clsx(
                "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                {
                  "bg-blue-600 text-white shadow-md": isActive,
                  "text-gray-700 hover:bg-sky-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800":
                    !isActive,
                },
              )}
            >
              <FinalIcon className="h-5 w-5" />
              <span className="hidden lg:inline">{link.name}</span>
              {showBadge && (
                <span className="ml-auto rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {seriesCount}
                </span>
              )}
            </Link>

            {/* Tooltip */}
            {link.description && (
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
