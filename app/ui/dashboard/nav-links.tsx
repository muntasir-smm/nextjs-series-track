// app/ui/dashboard/nav-links.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { navLinks } from "./nav-config";
import { getSeriesCount } from "@/app/lib/series";

interface NavLinksProps {
  isMobile?: boolean;
  userRole?: string;
}

export default function NavLinks({
  isMobile = false,
  userRole = "user",
}: NavLinksProps) {
  const pathname = usePathname();
  const [seriesCount, setSeriesCount] = useState(0);

  // Load ONLY count (fast)
  useEffect(() => {
    const loadCount = async () => {
      const count = await getSeriesCount();
      setSeriesCount(count);
    };
    loadCount();
  }, []);

  // Filter admin links
  const filteredLinks = navLinks.filter(
    (link) => !link.adminOnly || userRole === "admin",
  );

  return (
    <div
      className={clsx("flex items-center gap-1", {
        "flex-col w-full": isMobile,
        "flex-row": !isMobile,
      })}
    >
      {filteredLinks.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;

        const showBadge =
          link.showCount && link.name === "TV Series" && seriesCount > 0;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
              {
                "w-full": isMobile,
                "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800":
                  !isActive,
                "bg-blue-600 text-white shadow-md": isActive,
              },
            )}
          >
            <Icon className="h-5 w-5" />

            <span className="flex-1">{link.name}</span>

            {/* Series Count Badge */}
            {showBadge && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                {seriesCount}
              </span>
            )}

            {/* Active underline (clean V1 style) */}
            {isActive && !isMobile && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-white" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
