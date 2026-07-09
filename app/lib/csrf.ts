// app/lib/csrf.ts

import crypto from "crypto";

// In-memory store for CSRF tokens (consider using Redis in production)
const tokenStore: Map<string, { token: string; expires: number }> = new Map();

// Clean up expired tokens periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of tokenStore.entries()) {
      if (value.expires < now) {
        tokenStore.delete(key);
      }
    }
  },
  60 * 60 * 1000,
); // Clean up every hour

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  tokenStore.set(sessionId, { token, expires });
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    tokenStore.delete(sessionId);
    return false;
  }
  return stored.token === token;
}

export function removeCSRFToken(sessionId: string): void {
  tokenStore.delete(sessionId);
}

// Middleware for API routes
export function withCSRF(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    // Only check POST, PUT, DELETE, PATCH
    const method = request.method.toUpperCase();
    if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      return handler(request);
    }

    // Get session ID from cookie or header
    const sessionId =
      request.headers.get("x-session-id") ||
      request.headers.get("cookie")?.match(/session=([^;]+)/)?.[1] ||
      "unknown";

    // Get CSRF token from header or body
    const csrfToken = request.headers.get("x-csrf-token");

    // Try to get from body if not in header
    let bodyToken = csrfToken;
    if (!bodyToken) {
      try {
        const body = await request.clone().json();
        bodyToken = body._csrf;
      } catch {
        // Body might not be JSON or doesn't have _csrf
      }
    }

    if (!bodyToken) {
      return new Response(JSON.stringify({ error: "CSRF token missing" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!validateCSRFToken(sessionId, bodyToken)) {
      return new Response(JSON.stringify({ error: "Invalid CSRF token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(request);
  };
}
