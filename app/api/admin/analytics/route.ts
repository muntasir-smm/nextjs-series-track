// app/api/admin/analytics/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { sql } from "@/app/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Total users
    const totalUsers = await sql`SELECT COUNT(*) FROM users`;

    // Active users (last 7 days)
    const activeUsers = await sql`
      SELECT COUNT(DISTINCT user_id) FROM user_activity 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `;

    // Total series tracked
    const totalSeries = await sql`SELECT COUNT(*) FROM user_series`;

    // Most tracked series
    const mostTracked = await sql`
      SELECT name, COUNT(*) as count 
      FROM user_series 
      GROUP BY name 
      ORDER BY count DESC 
      LIMIT 10
    `;

    // Popular genres from TMDB (approximated from user_series)
    const popularGenres = await sql`
      SELECT 
        CASE 
          WHEN name ILIKE '%drama%' THEN 'Drama'
          WHEN name ILIKE '%comedy%' THEN 'Comedy'
          WHEN name ILIKE '%action%' THEN 'Action'
          WHEN name ILIKE '%thriller%' THEN 'Thriller'
          ELSE 'Other'
        END as genre,
        COUNT(*) as count
      FROM user_series
      GROUP BY genre
      ORDER BY count DESC
    `;

    // User engagement (average progress)
    const avgProgress = await sql`
      SELECT AVG(watch_progress) FROM user_series
    `;

    // New users this month
    const newUsersThisMonth = await sql`
      SELECT COUNT(*) FROM users 
      WHERE created_at > DATE_TRUNC('month', NOW())
    `;

    return NextResponse.json({
      totalUsers: parseInt(totalUsers[0].count),
      activeUsers: parseInt(activeUsers[0].count),
      totalSeries: parseInt(totalSeries[0].count),
      mostTrackedSeries: mostTracked,
      popularGenres: popularGenres,
      averageProgress: Math.round(parseFloat(avgProgress[0].avg) || 0),
      newUsersThisMonth: parseInt(newUsersThisMonth[0].count),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
