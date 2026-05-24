// scripts/seed.js - Run manually: node scripts/seed.js

const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcrypt");
const { users, defaultSeries } = require("../app/lib/placeholder-data.js");

const sql = neon(process.env.POSTGRES_URL);

async function seed() {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_series (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        series_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        total_seasons INTEGER DEFAULT 0,
        upcoming_seasons TEXT[] DEFAULT '{}',
        watched_seasons BOOLEAN[] DEFAULT '{}',
        watch_progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, series_id)
      );
    `;

    // Seed demo users (only if they don't exist)
    for (const user of users) {
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${user.email} LIMIT 1
      `;

      if (existingUser.length === 0) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        `;
      }
    }

    // Seed default series ONLY for the demo user
    const demoUser = await sql`
      SELECT id FROM users WHERE email = 'user@nextmail.com' LIMIT 1
    `;

    if (demoUser.length > 0) {
      const userId = demoUser[0].id;

      // Check if demo user already has series
      const existingSeries = await sql`
        SELECT COUNT(*) FROM user_series WHERE user_id = ${userId}
      `;

      if (existingSeries[0].count === 0) {
        for (const series of defaultSeries) {
          await sql`
            INSERT INTO user_series (
              user_id, series_id, name, total_seasons, 
              upcoming_seasons, watched_seasons, watch_progress
            ) VALUES (
              ${userId}, ${series.id}, ${series.name}, ${series.totalSeasons},
              ${series.upcomingSeasons}, ${series.watchedSeasons}, ${series.watchProgress}
            )
            ON CONFLICT (user_id, series_id) DO NOTHING;
          `;
        }
      } else {
      }
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
