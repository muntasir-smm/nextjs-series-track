// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const users = await sql`
      SELECT id, name, email, role, created_at, last_login, is_banned, is_active, ban_reason
      FROM users
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ users: [] }, { status: 500 });
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

    // Reset Password
    if (action === "resetPassword") {
      if (!data?.newPassword || data.newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 },
        );
      }
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await sql`
        UPDATE users 
        SET password = ${hashedPassword}
        WHERE id = ${userId}
      `;
      return NextResponse.json({
        success: true,
        message: "Password reset successfully",
      });
    }

    // Ban User - prevents login
    if (action === "ban") {
      await sql`
        UPDATE users 
        SET 
          is_banned = true, 
          is_active = false, 
          ban_reason = ${data?.reason || "No reason provided"}
        WHERE id = ${userId}
      `;
      return NextResponse.json({
        success: true,
        message: "User banned successfully",
      });
    }

    // Unban User - restores login ability
    if (action === "unban") {
      await sql`
        UPDATE users 
        SET 
          is_banned = false, 
          is_active = true, 
          ban_reason = NULL
        WHERE id = ${userId}
      `;
      return NextResponse.json({
        success: true,
        message: "User unbanned successfully",
      });
    }

    // Toggle Active Status
    if (action === "toggleActive") {
      const newStatus = data?.isActive ?? true;
      await sql`
        UPDATE users 
        SET is_active = ${newStatus}
        WHERE id = ${userId}
      `;
      return NextResponse.json({
        success: true,
        message: `User ${newStatus ? "activated" : "deactivated"}`,
      });
    }

    // Change Role
    if (action === "changeRole") {
      await sql`
        UPDATE users SET role = ${data?.role} WHERE id = ${userId}
      `;
      return NextResponse.json({ success: true, message: "User role updated" });
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
