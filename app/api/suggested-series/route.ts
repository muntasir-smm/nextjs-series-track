// app/api/suggested-series/route.ts

import { NextResponse } from "next/server";
import { defaultSeries } from "@/app/lib/placeholder-data";

export async function GET() {
  // Return all default series as suggestions
  const suggestedSeries = defaultSeries.map((series) => ({
    id: series.id,
    name: series.name,
    totalSeasons: series.totalSeasons,
    upcomingSeasons: series.upcomingSeasons,
    watchProgress: series.watchProgress,
  }));

  return NextResponse.json(suggestedSeries);
}
