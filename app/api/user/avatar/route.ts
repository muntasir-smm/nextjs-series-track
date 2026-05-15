// app/api/user/avatar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import { put, del } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    console.log("1. Starting avatar upload...");

    // Check for Blob token first
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is missing");
      return NextResponse.json(
        {
          error: "Storage service not configured",
        },
        { status: 500 },
      );
    }
    console.log("2. Token exists");

    const session = await auth();
    console.log("3. Session:", session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;
    console.log("4. File received:", {
      name: file?.name,
      type: file?.type,
      size: file?.size,
    });

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
    console.log("5. Old avatar:", oldAvatarUrl ? "exists" : "none");

    // Get file extension
    const ext = file.type.split("/")[1];
    const fileName = `avatars/${session.user.id}-${Date.now()}.${ext}`;
    console.log("6. File name:", fileName);

    console.log("7. Uploading to Vercel Blob...");
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    });
    console.log("8. Uploaded to:", blob.url);

    // Update database with new avatar URL
    await sql`
      UPDATE users 
      SET avatar_url = ${blob.url}
      WHERE email = ${session.user.email}
    `;
    console.log("9. Database updated");

    // Delete old avatar in background
    if (oldAvatarUrl && oldAvatarUrl !== blob.url) {
      Promise.resolve().then(async () => {
        try {
          const urlParts = oldAvatarUrl.split("/");
          const blobPath = urlParts.slice(-2).join("/");
          await del(blobPath);
          console.log("10. Old avatar deleted:", blobPath);
        } catch (e) {
          console.error("Failed to delete old avatar:", e);
        }
      });
    }

    console.log("11. Success!");
    return NextResponse.json({ avatarUrl: blob.url });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image: " + (error as Error).message },
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
        const urlParts = avatarUrl.split("/");
        const blobPath = urlParts.slice(-2).join("/");

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
