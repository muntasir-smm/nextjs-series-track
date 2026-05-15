// app/api/user/avatar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Helper to save base64 image
async function saveBase64Image(
  base64String: string,
  userId: string,
): Promise<string> {
  const matches = base64String.match(
    /^data:image\/([A-Za-z-+\/]+);base64,(.+)$/,
  );
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid image data");
  }

  const ext = matches[1].split("/")[0];
  const imageBuffer = Buffer.from(matches[2], "base64");
  const fileName = `${userId}-${uuidv4()}.${ext}`;
  const filePath = path.join(process.cwd(), "public/uploads/avatars", fileName);

  // Ensure directory exists
  await writeFile(filePath, imageBuffer);

  return `/uploads/avatars/${fileName}`;
}

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

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Save image
    const avatarUrl = await saveBase64Image(base64, session.user.id);

    // Get old avatar to delete later
    const oldAvatar = await sql`
      SELECT avatar_url FROM users WHERE email = ${session.user.email}
    `;

    // Update database
    await sql`
      UPDATE users 
      SET avatar_url = ${avatarUrl}, updated_at = NOW()
      WHERE email = ${session.user.email}
    `;

    // Delete old avatar file if exists
    if (oldAvatar[0]?.avatar_url) {
      try {
        const oldPath = path.join(
          process.cwd(),
          "public",
          oldAvatar[0].avatar_url,
        );
        await unlink(oldPath);
      } catch (e) {
        console.error("Failed to delete old avatar:", e);
      }
    }

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
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
      SET avatar_url = NULL, updated_at = NOW()
      WHERE email = ${session.user.email}
    `;

    // Delete old avatar file if exists
    if (oldAvatar[0]?.avatar_url) {
      try {
        const oldPath = path.join(
          process.cwd(),
          "public",
          oldAvatar[0].avatar_url,
        );
        await unlink(oldPath);
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
