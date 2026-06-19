// app/admin/layout.tsx

import TopNav from "@/app/ui/dashboard/topnav";
import { ShieldCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav />

      {/* Admin Header */}
      <div className=" border-b border-white/20 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white md:text-2xl">
                  Admin Panel
                </h1>
                <p className="text-xs text-white/80">
                  Manage users, monitor system, and control content
                </p>
              </div>
            </div>

            {/* Right side - Exit Button */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
