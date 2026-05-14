// app/layout.tsx

import "../app/ui/global.css";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
