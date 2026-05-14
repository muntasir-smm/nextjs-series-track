// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const sql = neon(process.env.POSTGRES_URL!);

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 },
      );
    }

    // Create new user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${userId}, ${name}, ${email}, ${hashedPassword})
    `;

    // Add sample series for new user (fire and forget, don't await)
    const { defaultSeries } = await import("@/app/lib/placeholder-data");
    const sampleSeries = defaultSeries.slice(0, 5);

    // Use Promise.all for parallel inserts
    await Promise.all(
      sampleSeries.map(
        (series) => sql`
        INSERT INTO user_series (
          user_id, series_id, name, total_seasons, 
          upcoming_seasons, watched_seasons, watch_progress
        ) VALUES (
          ${userId}, ${series.id}, ${series.name}, ${series.totalSeasons},
          ${series.upcomingSeasons}, ${series.watchedSeasons}, ${series.watchProgress}
        )
        ON CONFLICT (user_id, series_id) DO NOTHING
      `,
      ),
    );

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
