// scripts/seed.js

const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcrypt");
const { users, defaultSeries } = require("../app/lib/placeholder-data.js");

const sql = neon(process.env.POSTGRES_URL);

async function seed() {
  try {
    console.log("🌱 Starting database seed...\n");

    // Create users table
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
    console.log("✅ Users table ready");

    // Create user_series table
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
    console.log("✅ User series table ready");

    // Seed users
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log(`✅ Seeded ${users.length} users`);

    // Get demo user ID
    const users_list = await sql`SELECT id FROM users LIMIT 1`;

    if (users_list.length > 0) {
      const userId = users_list[0].id;

      // Seed default series
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
      console.log(`✅ Seeded ${defaultSeries.length} series for demo user`);
    }

    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
