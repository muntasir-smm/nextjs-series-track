// app/api/user/avatar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import { put, del } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be less than 5MB" },
        { status: 400 },
      );
    }

    // Get file extension
    const ext = file.type.split("/")[1];
    const fileName = `avatars/${session.user.id}-${Date.now()}.${ext}`;

    // Upload to Vercel Blob

    const blob = await put(fileName, file, {
      access: "public",
    });

    // Update database

    const result = await sql`
      UPDATE users 
      SET avatar_url = ${blob.url}
      WHERE email = ${session.user.email}
      RETURNING id, email, avatar_url
    `;

    // Get old avatar URL to delete later
    const oldAvatar = await sql`
      SELECT avatar_url FROM users WHERE email = ${session.user.email}
    `;

    // Delete old avatar from blob storage
    if (oldAvatar[0]?.avatar_url && oldAvatar[0]?.avatar_url !== blob.url) {
      try {
        const oldUrl = oldAvatar[0].avatar_url;
        const oldUrlParts = oldUrl.split("/");
        const oldBlobPath = oldUrlParts.slice(-2).join("/");
        await del(oldBlobPath);
      } catch (e) {
        console.error("Failed to delete old avatar:", e);
      }
    }

    return NextResponse.json({ avatarUrl: blob.url });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar: " + (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get old avatar
    const oldAvatar = await sql`
      SELECT avatar_url FROM users WHERE email = ${session.user.email}
    `;

    // Update database to remove avatar
    await sql`
      UPDATE users 
      SET avatar_url = NULL
      WHERE email = ${session.user.email}
    `;

    // Delete old avatar from blob storage
    if (oldAvatar[0]?.avatar_url) {
      try {
        const oldUrl = oldAvatar[0].avatar_url;
        const oldUrlParts = oldUrl.split("/");
        const oldBlobPath = oldUrlParts.slice(-2).join("/");
        await del(oldBlobPath);
      } catch (e) {
        console.error("Failed to delete old avatar:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: "Failed to remove avatar" },
      { status: 500 },
    );
  }
}
