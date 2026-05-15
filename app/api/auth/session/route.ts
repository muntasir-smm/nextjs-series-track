// app/api/auth/session/route.ts

import { auth } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  return NextResponse.json(session);
}
