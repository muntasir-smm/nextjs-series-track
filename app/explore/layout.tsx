// app/explore/layout.tsx

import PublicNavbar from "@/app/ui/public-navbar";
import SiteFooter from "@/app/ui/site-footer";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />
      <div className="flex-1">{children}</div>
      <SiteFooter variant="public" />
    </div>
  );
}
