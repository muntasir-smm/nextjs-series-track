// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";

function safeInternalPath(value: string | null): string | null {
  if (!value) return null;
  // Only allow same-origin relative paths (block open redirects)
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const pathname = request.nextUrl.pathname;

  // Banned / inactive users cannot use the dashboard
  if (isLoggedIn && pathname.startsWith("/dashboard")) {
    if (
      session?.user?.is_banned === true ||
      session?.user?.is_active === false
    ) {
      const url = new URL("/login", request.url);
      url.searchParams.set(
        "error",
        session?.user?.is_banned ? "banned" : "inactive",
      );
      return NextResponse.redirect(url);
    }
  }

  // Admin routes — admin + active only
  if (isLoggedIn && pathname.startsWith("/admin")) {
    if (session?.user?.role !== "admin" || session?.user?.is_active === false) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Logged-in users leaving auth pages — honor ?next= when safe
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    const next = safeInternalPath(request.nextUrl.searchParams.get("next"));
    const dest = next || "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Guests cannot access dashboard — preserve destination for after login
  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Guests cannot access admin
  if (!isLoggedIn && pathname.startsWith("/admin")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
};
