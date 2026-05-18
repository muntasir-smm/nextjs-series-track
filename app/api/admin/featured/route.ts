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
      SELECT * FROM featured_series 
      WHERE is_active = true 
      ORDER BY added_at DESC
    `;
    return NextResponse.json(featured);
  } catch (error) {
    console.error("Error fetching featured series:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { series_id, series_name, poster_path, reason } =
      await request.json();

    await sql`
      INSERT INTO featured_series (series_id, series_name, poster_path, reason, added_by)
      VALUES (${series_id}, ${series_name}, ${poster_path}, ${reason}, ${session.user.id})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding featured series:", error);
    return NextResponse.json(
      { error: "Failed to add featured series" },
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await sql`UPDATE featured_series SET is_active = false WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing featured series:", error);
    return NextResponse.json(
      { error: "Failed to remove featured series" },
      { status: 500 },
    );
  }
}
