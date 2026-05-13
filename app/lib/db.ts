// app/lib/db.ts

import { neon } from "@neondatabase/serverless";

// Use POSTGRES_URL from your .env
const databaseUrl = process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("POSTGRES_URL is not set in environment variables");
}

export const sql = neon(databaseUrl);
