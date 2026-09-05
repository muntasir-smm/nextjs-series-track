// app/dashboard/layout.tsx

import TopNav from "@/app/ui/dashboard/topnav";
import Announcements from "@/app/ui/announcements";
import { auth } from "@/app/lib/auth";
import { getSeriesCount } from "@/app/lib/series";
import { Suspense } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const seriesCount = await getSeriesCount(session.user.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNav user={session.user} seriesCount={seriesCount} />

      <main className="pt-6 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Announcements />

          <Suspense
            fallback={
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
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
