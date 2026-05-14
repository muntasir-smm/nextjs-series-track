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

    // Create new user (without created_at/updated_at)
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${userId}, ${name}, ${email}, ${hashedPassword})
    `;

    // Optional: Add sample series for new user
    try {
      const { defaultSeries } = await import("@/app/lib/placeholder-data");
      const sampleSeries = defaultSeries.slice(0, 5);

      for (const series of sampleSeries) {
        await sql`
          INSERT INTO user_series (
            user_id, series_id, name, total_seasons, 
            upcoming_seasons, watched_seasons, watch_progress
          ) VALUES (
            ${userId}, ${series.id}, ${series.name}, ${series.totalSeasons},
            ${series.upcomingSeasons}, ${series.watchedSeasons}, ${series.watchProgress}
          )
          ON CONFLICT (user_id, series_id) DO NOTHING
        `;
      }
    } catch (seriesError) {
      console.error("Error adding sample series:", seriesError);
      // Don't fail the signup if series addition fails
    }

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
