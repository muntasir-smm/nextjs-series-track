// app/api/admin/featured/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const featured = await sql`
      SELECT id, series_id, series_name, poster_path, reason, is_active,
             COALESCE(media_type, 'tv') as media_type, added_at
      FROM featured_series
      WHERE is_active = true
      ORDER BY added_at DESC
    `;
    return NextResponse.json(featured);
  } catch (error) {
    console.error("Error fetching featured:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const series_id = String(body.series_id ?? body.tmdbId ?? "");
    const series_name = body.series_name || body.name;
    const poster_path = body.poster_path ?? body.posterPath ?? null;
    const reason = body.reason || "Featured pick";
    const media_type = body.media_type === "movie" ? "movie" : "tv";

    if (!series_id || !series_name) {
      return NextResponse.json(
        { error: "series_id and series_name required" },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO featured_series (
        series_id, series_name, poster_path, reason, added_by, media_type
      )
      VALUES (
        ${series_id},
        ${series_name},
        ${poster_path},
        ${reason},
        ${session.user.id},
        ${media_type}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding featured:", error);
    return NextResponse.json(
      { error: "Failed to add featured item" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const id = new URL(request.url).searchParams.get("id");
    await sql`UPDATE featured_series SET is_active = false WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing featured:", error);
    return NextResponse.json(
      { error: "Failed to remove featured item" },
      { status: 500 },
    );
  }
}
