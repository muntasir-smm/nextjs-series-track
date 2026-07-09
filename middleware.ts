// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const pathname = request.nextUrl.pathname;

  // Check if user is active (for dashboard routes)
  if (isLoggedIn && pathname.startsWith("/dashboard")) {
    // If user is deactivated or banned, redirect to login
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

  // Admin routes - extra protection
  if (isLoggedIn && pathname.startsWith("/admin")) {
    // Double-check: admin must have role === "admin" and be active
    if (session?.user?.role !== "admin" || session?.user?.is_active === false) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes
  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect admin routes
  if (!isLoggedIn && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
};
