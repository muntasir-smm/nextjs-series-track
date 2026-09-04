// app/layout.tsx

import "@/app/ui/global.css";
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
    process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://nextjs-series-track.vercel.app",
  ),
  keywords: ["TV series", "tracker", "watchlist", "entertainment", "TV shows"],
  authors: [{ name: "Series Tracker" }],
  openGraph: {
    title: "Series Tracker",
    description: "Track your favorite TV series and never miss an episode",
    type: "website",
    url: process.env.NEXTAUTH_URL || "https://nextjs-series-track.vercel.app",
  },
  icons: {
    icon: [
      { url: "/images/favicon.ico", sizes: "any" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/images/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
