// app/ui/dashboard/nav-links.tsx

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
    <nav
      className={clsx("flex gap-1", {
        "flex-col w-full": isMobile,
        "flex-row items-center": !isMobile,
      })}
    >
      {links.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

        const Icon = link.icon;
        const showBadge =
          link.showCount && link.name === "TV Series" && seriesCount > 0;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "relative flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
              isMobile && "w-full",
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{link.name}</span>

            {showBadge && (
              <span
                className={clsx(
                  "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
                )}
              >
                {seriesCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
