// app/api/admin/announcements/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";

// Get all announcements
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const announcements = await sql`
      SELECT a.*, u.name as creator_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `;
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}

// Create new announcement
export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { title, message, type, expiresAt } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO announcements (title, message, type, created_by, expires_at)
      VALUES (${title}, ${message}, ${type || "info"}, ${session.user.id}, ${expiresAt || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 },
    );
  }
}

// Update announcement (deactivate/reactivate)
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, isActive } = await request.json();

    await sql`
      UPDATE announcements 
      SET is_active = ${isActive}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 },
    );
  }
}

// Delete announcement
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await sql`DELETE FROM announcements WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
