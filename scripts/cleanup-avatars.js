// scripts/cleanup-avatars.js

const { list, del } = require("@vercel/blob");
require("dotenv").config();

async function cleanupOrphanedAvatars() {
  console.log("Listing all avatars...");

  // List all blobs in the avatars folder
  const { blobs } = await list({ prefix: "avatars/" });

  console.log(`Found ${blobs.length} avatars`);

  // Get all current avatar URLs from database
  const { neon } = require("@neondatabase/serverless");
  const sql = neon(process.env.POSTGRES_URL);

  const users = await sql`
    SELECT avatar_url FROM users WHERE avatar_url IS NOT NULL
  `;

  const currentUrls = new Set(users.map((u) => u.avatar_url));
  console.log(`Currently used avatars: ${currentUrls.size}`);

  // Find and delete orphaned blobs
  let deletedCount = 0;
  for (const blob of blobs) {
    if (!currentUrls.has(blob.url)) {
      console.log(`Deleting orphaned: ${blob.url}`);
      await del(blob.url);
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} orphaned avatars`);
}

cleanupOrphanedAvatars().catch(console.error);
