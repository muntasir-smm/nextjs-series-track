// app/api/public/featured/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const featured = await sql`
      SELECT 
        id,
        series_id,
        series_name,
        poster_path,
        reason,
        added_at
      FROM featured_series
      WHERE is_active = true
      ORDER BY added_at DESC
      LIMIT 12
    `;

    return NextResponse.json({
      series: (featured || []).map((row: any) => ({
        id: String(row.id),
        seriesId: row.series_id,
        name: row.series_name,
        posterPath: row.poster_path,
        reason: row.reason || "Featured pick",
        addedAt: row.added_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching public featured series:", error);
    return NextResponse.json({ series: [] }, { status: 500 });
  }
}