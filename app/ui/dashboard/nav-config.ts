// app/ui/dashboard/nav-config.ts

"use client";

import {
  FilmIcon,
  SparklesIcon,
  HomeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const navLinks = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "TV Series",
    href: "/dashboard/tvSeries",
    icon: FilmIcon,
    showCount: true,
  },
  {
    name: "Discover",
    href: "/dashboard/discover",
    icon: SparklesIcon,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: ShieldCheckIcon,
    adminOnly: true,
  },
];
