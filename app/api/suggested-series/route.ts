// app/api/suggested-series/route.ts

import { NextResponse } from "next/server";
import { defaultSeries } from "@/app/lib/placeholder-data";

export async function GET() {
  // This returns the default series for public/discover pages
  // In production, this could be read from a database or file
  const suggestedSeries = defaultSeries.map((series) => ({
    id: series.id,
    name: series.name,
    totalSeasons: series.totalSeasons,
    upcomingSeasons: series.upcomingSeasons,
    watchProgress: series.watchProgress,
  }));

  return NextResponse.json(suggestedSeries);
}
