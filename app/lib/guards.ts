// app/lib/guards.ts

import { auth } from "@/app/lib/auth";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return session;
}
