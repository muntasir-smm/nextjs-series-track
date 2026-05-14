// app/layout.tsx

import "./ui/global.css"; // Fixed import path
import { inter } from "@/app/ui/fonts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Series Tracker",
    default: "Series Tracker",
  },
  description:
    "Track your favorite TV series, manage watchlists, and never miss an episode.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  keywords: ["TV series", "tracker", "watchlist", "entertainment", "TV shows"],
  authors: [{ name: "Series Tracker" }],
  openGraph: {
    title: "Series Tracker",
    description: "Track your favorite TV series and never miss an episode",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
