// app/api/public-series/route.ts

export const runtime = "edge"; // Optional
export const dynamic = "force-static"; // Optional

import { NextResponse } from "next/server";
import { defaultSeries } from "@/app/lib/placeholder-data";

export async function GET() {
  // This route is public (no auth check needed)
  const sampleSeries = defaultSeries.slice(0, 12).map((series) => ({
    id: series.id,
    name: series.name,
    totalSeasons: series.totalSeasons,
    upcomingSeasons: series.upcomingSeasons,
    watchProgress: series.watchProgress,
  }));

  return NextResponse.json(sampleSeries);
}
