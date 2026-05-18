// app/api/admin/backup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";

// Create backup
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch all data for backup
    const [users, userSeries, featuredSeries, announcements] =
      await Promise.all([
        sql`SELECT id, name, email, role, created_at, last_login, is_banned, is_active, avatar_url FROM users`,
        sql`SELECT user_id, series_id, name, total_seasons, upcoming_seasons, watched_seasons, watch_progress, poster_path, backdrop_path, overview FROM user_series`,
        sql`SELECT series_id, series_name, poster_path, reason, is_active FROM featured_series`,
        sql`SELECT title, message, type, is_active, created_at, expires_at FROM announcements`,
      ]);

    const backup = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      data: {
        users,
        userSeries,
        featuredSeries,
        announcements,
      },
    };

    // Return as JSON
    return NextResponse.json(backup);
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 },
    );
  }
}

// Restore from backup
export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const backup = await request.json();

    // Validate backup structure
    if (!backup.data || !backup.data.users) {
      return NextResponse.json(
        { error: "Invalid backup file" },
        { status: 400 },
      );
    }

    // Start transaction
    await sql`BEGIN`;

    try {
      // Restore users (skip existing to avoid conflicts)
      for (const user of backup.data.users) {
        await sql`
          INSERT INTO users (id, name, email, role, created_at, last_login, is_banned, is_active, avatar_url)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${user.role}, ${user.created_at}, ${user.last_login}, ${user.is_banned}, ${user.is_active}, ${user.avatar_url})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            is_banned = EXCLUDED.is_banned,
            is_active = EXCLUDED.is_active,
            avatar_url = EXCLUDED.avatar_url
        `;
      }

      // Restore user_series
      for (const series of backup.data.userSeries) {
        await sql`
          INSERT INTO user_series (user_id, series_id, name, total_seasons, upcoming_seasons, watched_seasons, watch_progress, poster_path, backdrop_path, overview)
          VALUES (${series.user_id}, ${series.series_id}, ${series.name}, ${series.total_seasons}, ${series.upcoming_seasons}, ${series.watched_seasons}, ${series.watch_progress}, ${series.poster_path}, ${series.backdrop_path}, ${series.overview})
          ON CONFLICT (user_id, series_id) DO UPDATE SET
            name = EXCLUDED.name,
            total_seasons = EXCLUDED.total_seasons,
            upcoming_seasons = EXCLUDED.upcoming_seasons,
            watched_seasons = EXCLUDED.watched_seasons,
            watch_progress = EXCLUDED.watch_progress,
            poster_path = EXCLUDED.poster_path,
            backdrop_path = EXCLUDED.backdrop_path,
            overview = EXCLUDED.overview
        `;
      }

      // Restore featured_series
      for (const featured of backup.data.featuredSeries) {
        await sql`
          INSERT INTO featured_series (series_id, series_name, poster_path, reason, is_active)
          VALUES (${featured.series_id}, ${featured.series_name}, ${featured.poster_path}, ${featured.reason}, ${featured.is_active})
          ON CONFLICT (series_id) DO UPDATE SET
            series_name = EXCLUDED.series_name,
            poster_path = EXCLUDED.poster_path,
            reason = EXCLUDED.reason,
            is_active = EXCLUDED.is_active
        `;
      }

      // Restore announcements
      for (const announcement of backup.data.announcements) {
        await sql`
          INSERT INTO announcements (title, message, type, is_active, created_at, expires_at)
          VALUES (${announcement.title}, ${announcement.message}, ${announcement.type}, ${announcement.is_active}, ${announcement.created_at}, ${announcement.expires_at})
        `;
      }

      await sql`COMMIT`;
      return NextResponse.json({
        success: true,
        message: "Restore completed successfully",
      });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 },
    );
  }
}
