// app/dashboard/layout.tsx

import TopNav from "@/app/ui/dashboard/topnav";
import Announcements from "@/app/ui/announcements";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav />
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Announcements - Show to all logged-in users */}
          <Announcements />

          {/* Main content with Suspense for loading states */}
          <Suspense
            fallback={
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
