// app/api/test-upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    console.log("Test upload - file:", file.name, file.size, file.type);

    const blob = await put(
      `test-${Date.now()}.${file.type.split("/")[1]}`,
      file,
      {
        access: "public",
      },
    );

    return NextResponse.json({ url: blob.url, size: file.size });
  } catch (error) {
    console.error("Test upload error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
