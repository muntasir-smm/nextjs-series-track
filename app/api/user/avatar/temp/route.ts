// app/api/user/avatar/temp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { del } from "@vercel/blob";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const avatarUrl = searchParams.get("url");

    if (!avatarUrl) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Delete from blob storage
    const urlParts = avatarUrl.split("/");
    const blobPath = urlParts.slice(-2).join("/");
    await del(blobPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting temp avatar:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 },
    );
  }
}
