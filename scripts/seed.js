// scripts/seed.js
// Usage: node -r dotenv/config ./scripts/seed.js
// Requires: POSTGRES_URL, schema already applied

const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");

const sql = neon(process.env.POSTGRES_URL);

if (!process.env.POSTGRES_URL) {
  console.error("POSTGRES_URL is not set");
  process.exit(1);
}

async function seed() {
  console.log("Seeding…");

  for (const u of DEMO_USERS) {
    const existing = await sql`
      SELECT id FROM users WHERE email = ${u.email} LIMIT 1
    `;
    if (existing.length > 0) {
      console.log(`Skip existing user: ${u.email}`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 10);
    await sql`
      INSERT INTO users (
        id, name, email, password, role,
        is_approved, is_active, is_banned, approved_at
      ) VALUES (
        ${u.id},
        ${u.name},
        ${u.email},
        ${hash},
        ${u.role},
        ${u.is_approved},
        ${u.is_active},
        false,
        NOW()
      )
    `;
    console.log(`Created ${u.role}: ${u.email} / ${u.password}`);
  }

  console.log("Done. Change demo passwords in production.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
