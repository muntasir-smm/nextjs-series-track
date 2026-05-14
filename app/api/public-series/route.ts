// app/api/public-series/route.ts

import { NextResponse } from "next/server";
import { defaultSeries } from "@/app/lib/placeholder-data";

export async function GET() {
  // Return 12 sample series for the landing page
  const sampleSeries = defaultSeries.slice(0, 12).map((series) => ({
    id: series.id,
    name: series.name,
    totalSeasons: series.totalSeasons,
    upcomingSeasons: series.upcomingSeasons,
    watchProgress: series.watchProgress,
  }));

  return NextResponse.json(sampleSeries);
}
