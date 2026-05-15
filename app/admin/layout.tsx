// app/admin/layout.tsx

import TopNav from "@/app/ui/dashboard/topnav";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav />

      {/* Admin Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-800 dark:text-yellow-400">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Admin Mode</span>
            <Link href="/dashboard" className="underline hover:no-underline">
              Exit to Dashboard
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
