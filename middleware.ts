// middleware.ts

import { auth } from "@/app/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const userRole = req.auth?.user?.role;

  // Admin route protection
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    const newUrl = new URL("/dashboard", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Define public routes that don't require authentication
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/api/public");

  // Allow access to public routes without login
  if (isPublicRoute) {
    // If user is logged in and tries to access login/signup, redirect to dashboard
    if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
      const newUrl = new URL("/dashboard", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }
    return; // Allow access to public routes
  }

  // Require login for all other routes (dashboard, tv-series, etc.)
  if (!isLoggedIn) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // User is logged in and accessing protected routes, allow access
  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
