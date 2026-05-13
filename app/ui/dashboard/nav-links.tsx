// app/ui/dashboard/nav-links.tsx

"use client";

import {
  HomeIcon,
  FilmIcon,
  ClockIcon,
  HeartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "TV Series", href: "/dashboard/tvSeries", icon: FilmIcon },
  { name: "Watchlist", href: "/dashboard/watchlist", icon: ClockIcon },
  { name: "Favorites", href: "/dashboard/favorites", icon: HeartIcon },
  { name: "Discover", href: "/dashboard/discover", icon: MagnifyingGlassIcon },
];

interface NavLinksProps {
  isMobile?: boolean;
}

export default function NavLinks({ isMobile = false }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <div
      className={clsx("flex", {
        "flex-row space-x-1": !isMobile,
        "flex-col space-y-1": isMobile,
      })}
    >
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/dashboard" && pathname?.startsWith(link.href));

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              {
                "bg-blue-600 text-white shadow-md": isActive,
                "text-gray-700 hover:bg-sky-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800":
                  !isActive,
                "justify-center": !isMobile,
                "justify-start": isMobile,
              },
            )}
          >
            <LinkIcon className="h-5 w-5" />
            <span
              className={clsx({
                "hidden lg:inline": !isMobile,
                inline: isMobile,
              })}
            >
              {link.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
