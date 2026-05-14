// app/ui/fonts.ts
import { Inter, Lusitana } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Ensures text remains visible during font load
});

export const lusitana = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Optional: Add a monospace font for code
export const mono = Inter({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});
