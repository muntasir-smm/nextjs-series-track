// app/lib/rate-limit.ts

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for serverless, consider using Redis or Upstash)
const store: RateLimitStore = {};

export function rateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs } = options;

  return {
    check: (
      key: string,
    ): { success: boolean; remaining?: number; resetTime?: number } => {
      const now = Date.now();
      const record = store[key];

      // Clean up expired records
      if (record && now > record.resetTime) {
        delete store[key];
      }

      // If no record exists, create one
      if (!store[key]) {
        store[key] = {
          count: 0,
          resetTime: now + windowMs,
        };
      }

      // Check if limit is exceeded
      if (store[key].count >= maxRequests) {
        return {
          success: false,
          remaining: 0,
          resetTime: store[key].resetTime,
        };
      }

      // Increment count
      store[key].count++;
      const remaining = maxRequests - store[key].count;

      return {
        success: true,
        remaining,
        resetTime: store[key].resetTime,
      };
    },
  };
}

// Middleware for API routes
export async function withRateLimit(
  request: Request,
  handler: () => Promise<Response>,
  options: RateLimitOptions = { maxRequests: 60, windowMs: 60 * 1000 }, // 60 requests per minute
) {
  // Get client IP
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Create a key based on IP and path
  const url = new URL(request.url);
  const key = `${ip}:${url.pathname}`;

  const limiter = rateLimit(options);
  const result = limiter.check(key);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        resetTime: result.resetTime,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After":
            Math.ceil((result.resetTime || 0) - Date.now()) / 1000 + "",
        },
      },
    );
  }

  const response = await handler();

  // Add rate limit headers
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Limit", options.maxRequests.toString());
  headers.set("X-RateLimit-Remaining", (result.remaining || 0).toString());
  headers.set("X-RateLimit-Reset", (result.resetTime || 0).toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
