// app/lib/signout-action.ts

"use server";

import { signOut } from "@/app/lib/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
