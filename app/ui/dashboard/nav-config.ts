// app/ui/dashboard/nav-config.ts
"use client";

import {
  FilmIcon,
  SparklesIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const navLinks = [
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
  //   {
  //     name: "Profile",
  //     href: "/dashboard/profile",
  //     icon: UserIcon,
  //   },
  {
    name: "Admin Panel",
    href: "/admin",
    icon: ShieldCheckIcon,
    adminOnly: true,
  },
];
