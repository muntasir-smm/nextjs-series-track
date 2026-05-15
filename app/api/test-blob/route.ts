// app/api/test-blob/route.ts

import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  try {
    // Check if token exists
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "BLOB_READ_WRITE_TOKEN is missing",
        hasToken: false,
      });
    }

    // Try to list blobs
    const { blobs } = await list({ prefix: "avatars/", limit: 1 });

    return NextResponse.json({
      success: true,
      hasToken: true,
      tokenPrefix: token.substring(0, 15) + "...",
      hasBlobs: blobs.length > 0,
      blobCount: blobs.length,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    });
  }
}
