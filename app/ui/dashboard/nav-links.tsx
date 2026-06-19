"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navLinks } from "./nav-config";

type NavLinksProps = {
  isMobile?: boolean;
  userRole?: string;
  seriesCount?: number;
};

export default function NavLinks({
  isMobile = false,
  userRole = "user",
  seriesCount = 0,
}: NavLinksProps) {
  const pathname = usePathname();

  const links = useMemo(
    () => navLinks.filter((l) => !l.adminOnly || userRole === "admin"),
    [userRole],
  );

  return (
    <div
      className={clsx("flex gap-1", {
        "flex-col w-full": isMobile,
        "flex-row": !isMobile,
      })}
    >
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;

        const showBadge =
          link.showCount && link.name === "TV Series" && seriesCount > 0;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
              !active &&
                "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",

              active &&
                "bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-md",
            )}
          >
            <Icon className="h-5 w-5" />

            <span className="flex-1">{link.name}</span>

            {/* BADGE */}
            {showBadge && (
              <span
                className={clsx(
                  "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold",
                  "bg-white/20 text-white dark:bg-white/10",
                )}
              >
                {seriesCount}
              </span>
            )}

            {/* ACTIVE INDICATOR */}
            {/* {active && !isMobile && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-white/80 rounded-full" />
            )} */}
          </Link>
        );
      })}
    </div>
  );
}
