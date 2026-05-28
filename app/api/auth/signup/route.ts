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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id, is_approved FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser.length > 0) {
      // If user exists but not approved, inform them
      if (!existingUser[0].is_approved) {
        return NextResponse.json(
          {
            error: "Account pending approval. Please wait for admin approval.",
          },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 },
      );
    }

    // Create new user (pending approval)
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (id, name, email, password, is_approved, is_active)
      VALUES (${userId}, ${name}, ${email}, ${hashedPassword}, false, false)
    `;

    return NextResponse.json(
      {
        message:
          "Account created! Your account is pending admin approval. You'll be able to sign in once approved.",
        requiresApproval: true,
      },
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
