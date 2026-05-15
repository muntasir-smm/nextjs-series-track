// app/api/user/avatar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import { put, del, head } from "@vercel/blob";

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

    // Get current user to check existing avatar
    const currentUser = await sql`
      SELECT avatar_url FROM users WHERE email = ${session.user.email}
    `;
    const oldAvatarUrl = currentUser[0]?.avatar_url;

    // Get file extension
    const ext = file.type.split("/")[1];
    const fileName = `avatars/${session.user.id}-${Date.now()}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    });

    // Update database with new avatar URL
    await sql`
      UPDATE users 
      SET avatar_url = ${blob.url}
      WHERE email = ${session.user.email}
    `;

    // Delete old avatar from blob storage (if it exists and is different)
    if (oldAvatarUrl && oldAvatarUrl !== blob.url) {
      try {
        // Extract the blob path from the URL
        const urlParts = new URL(oldAvatarUrl);
        const pathname = urlParts.pathname;
        const blobPath = pathname.startsWith("/")
          ? pathname.slice(1)
          : pathname;

        console.log("Deleting old avatar:", blobPath);
        await del(blobPath);
        console.log("Old avatar deleted successfully");
      } catch (e) {
        console.error("Failed to delete old avatar:", e);
        // Don't fail the request if deletion fails
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

    // Get current user's avatar
    const currentUser = await sql`
      SELECT avatar_url FROM users WHERE email = ${session.user.email}
    `;
    const avatarUrl = currentUser[0]?.avatar_url;

    // Update database to remove avatar
    await sql`
      UPDATE users 
      SET avatar_url = NULL
      WHERE email = ${session.user.email}
    `;

    // Delete avatar from blob storage
    if (avatarUrl) {
      try {
        const urlParts = new URL(avatarUrl);
        const pathname = urlParts.pathname;
        const blobPath = pathname.startsWith("/")
          ? pathname.slice(1)
          : pathname;

        console.log("Deleting avatar:", blobPath);
        await del(blobPath);
        console.log("Avatar deleted successfully");
      } catch (e) {
        console.error("Failed to delete avatar:", e);
        // Don't fail the request if deletion fails
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
