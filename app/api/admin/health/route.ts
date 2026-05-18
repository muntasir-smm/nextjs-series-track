// app/api/admin/health/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";

interface HealthItem {
  status: string;
  details: any;
}

interface HealthResponse {
  database: HealthItem;
  tmdb: HealthItem;
  blob: HealthItem;
  system: HealthItem;
  timestamp: string;
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const health: HealthResponse = {
    database: { status: "unknown", details: null },
    tmdb: { status: "unknown", details: null },
    blob: { status: "unknown", details: null },
    system: { status: "unknown", details: null },
    timestamp: new Date().toISOString(),
  };

  // Check Database
  try {
    const result =
      await sql`SELECT NOW() as time, COUNT(*) as user_count FROM users`;
    health.database = {
      status: "healthy",
      details: {
        connected: true,
        userCount: parseInt(result[0].user_count),
        currentTime: result[0].time,
      },
    };
  } catch (error) {
    health.database = {
      status: "error",
      details: { error: String(error) },
    };
  }

  // Check TMDB API
  try {
    const tmdbKey = process.env.TMDB_API_KEY;
    if (!tmdbKey) {
      throw new Error("TMDB_API_KEY not configured");
    }

    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/configuration?api_key=${tmdbKey}`,
      { next: { revalidate: 3600 } },
    );

    if (tmdbResponse.ok) {
      health.tmdb = {
        status: "healthy",
        details: {
          apiKeyConfigured: true,
          statusCode: tmdbResponse.status,
          rateLimitInfo: "TMDB Free Tier: ~50 requests/second, ~1000/day",
        },
      };
    } else {
      throw new Error(`TMDB API returned ${tmdbResponse.status}`);
    }
  } catch (error) {
    health.tmdb = {
      status: "error",
      details: { error: String(error) },
    };
  }

  // Check Vercel Blob Storage
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      throw new Error("BLOB_READ_WRITE_TOKEN not configured");
    }

    health.blob = {
      status: "healthy",
      details: {
        configured: true,
        tokenExists: true,
      },
    };
  } catch (error) {
    health.blob = {
      status: "error",
      details: { error: String(error) },
    };
  }

  // System Info
  const hasRequiredEnv =
    !!process.env.NEXTAUTH_URL && !!process.env.POSTGRES_URL;

  health.system = {
    status: hasRequiredEnv ? "healthy" : "degraded",
    details: {
      environment: process.env.NODE_ENV || "unknown",
      nextAuthUrl: process.env.NEXTAUTH_URL ? "Configured" : "Missing",
      databaseUrl: process.env.POSTGRES_URL ? "Configured" : "Missing",
      tmdbApiKey: process.env.TMDB_API_KEY ? "Configured" : "Missing",
      blobToken: process.env.BLOB_READ_WRITE_TOKEN ? "Configured" : "Missing",
      note:
        process.env.NODE_ENV === "development"
          ? "Development mode - this is normal"
          : "Production mode",
    },
  };

  // Overall status - check only critical components
  const criticalComponents = [
    health.database.status === "healthy",
    health.tmdb.status === "healthy",
    health.blob.status === "healthy",
  ];

  const allCriticalHealthy = criticalComponents.every(Boolean);
  health.system.status = allCriticalHealthy ? "healthy" : "degraded";

  return NextResponse.json(health);
}
