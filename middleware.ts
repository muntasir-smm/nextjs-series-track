// middleware.ts

import { auth } from "@/app/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const userRole = req.auth?.user?.role;
  const isBanned = req.auth?.user?.is_banned === true;

  // Block banned users from accessing any route
  if (isLoggedIn && isBanned) {
    const newUrl = new URL("/login?error=banned", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Admin route protection
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    const newUrl = new URL("/dashboard", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Define public routes
  const isPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/signup";

  // Redirect logged-in users away from public routes to dashboard
  if (isLoggedIn && isPublicRoute) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Allow public routes for non-logged-in users
  if (isPublicRoute) {
    return;
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }

  // Allow access to authenticated users
  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
