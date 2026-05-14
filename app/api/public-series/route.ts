// app/api/public-series/route.ts

import { NextResponse } from "next/server";
import { defaultSeries } from "@/app/lib/placeholder-data";

export async function GET() {
  // Return only first 12 series as samples (or all 43 if you want)
  const sampleSeries = defaultSeries.slice(0, 12).map((series) => ({
    id: series.id,
    name: series.name,
    totalSeasons: series.totalSeasons,
    upcomingSeasons: series.upcomingSeasons,
    watchProgress: series.watchProgress,
    // Don't send user-specific data
  }));

  return NextResponse.json(sampleSeries);
}
