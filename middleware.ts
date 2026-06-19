// middleware.ts

import { auth } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const user = req.auth?.user;
  const isLoggedIn = !!user;

  const role = user?.role ?? "user";
  const isBanned = user?.is_banned === true;

  // ==============================
  // 🚫 1. BLOCK BANNED USERS (HIGHEST PRIORITY)
  // ==============================
  if (isLoggedIn && isBanned) {
    const url = nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "banned");

    return NextResponse.redirect(url);
  }

  // ==============================
  // 🔐 2. PUBLIC ROUTES
  // ==============================
  const publicRoutes = ["/", "/login", "/signup"];

  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isPublicRoute) {
    const url = nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Allow public access for guests
  if (isPublicRoute && !isLoggedIn) {
    return NextResponse.next();
  }

  // ==============================
  // 🔐 3. PROTECT ALL APP ROUTES
  // ==============================
  if (!isLoggedIn) {
    const url = nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ==============================
  // 🛡️ 4. ADMIN PROTECTION
  // ==============================
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ==============================
  // ✅ 5. ALLOW ACCESS
  // ==============================
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
