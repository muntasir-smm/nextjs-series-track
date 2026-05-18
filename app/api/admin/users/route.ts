// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();

  // Check if user is admin
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch all users
    const users = await sql`
      SELECT id, name, email, role, created_at, last_login, is_banned, is_active
      FROM users
      ORDER BY created_at DESC
    `;

    console.log("Fetched users:", users.length); // Debug log

    return NextResponse.json({
      users: users || [],
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ users: [], total: 0 }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, action, data } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (action === "resetPassword") {
      if (!data?.newPassword) {
        return NextResponse.json(
          { error: "New password required" },
          { status: 400 },
        );
      }
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await sql`
        UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "ban") {
      await sql`
        UPDATE users 
        SET is_banned = true, banned_at = NOW(), ban_reason = ${data?.reason || "No reason provided"}
        WHERE id = ${userId}
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "unban") {
      await sql`
        UPDATE users 
        SET is_banned = false, ban_reason = NULL, banned_at = NULL
        WHERE id = ${userId}
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "toggleActive") {
      await sql`
        UPDATE users SET is_active = ${data?.isActive ?? true} WHERE id = ${userId}
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "changeRole") {
      await sql`
        UPDATE users SET role = ${data?.role} WHERE id = ${userId}
      `;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
