// app/api/announcements/active/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET() {
  try {
    const announcements = await sql`
      SELECT id, title, message, type
      FROM announcements
      WHERE is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `;
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching active announcements:", error);
    return NextResponse.json([]);
  }
}
