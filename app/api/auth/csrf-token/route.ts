// app/api/auth/csrf-token/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generateCSRFToken } from "@/app/lib/csrf";

export async function GET(request: NextRequest) {
  // Get session ID from cookie or generate one
  const sessionId =
    request.headers.get("cookie")?.match(/session=([^;]+)/)?.[1] ||
    `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const token = generateCSRFToken(sessionId);

  // Set session cookie if not exists
  const response = NextResponse.json({ token });

  if (!request.headers.get("cookie")?.includes("session=")) {
    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return response;
}
