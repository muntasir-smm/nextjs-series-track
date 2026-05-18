// app/lib/actions.ts

"use server";

import { signIn } from "@/app/lib/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Handle specific error types
      if (error.type === "CredentialsSignin") {
        return "Invalid email or password";
      }

      // Check for custom error messages
      if (error.cause?.err?.message === "banned") {
        return "Your account has been banned. Please contact support.";
      }

      if (error.cause?.err?.message === "inactive") {
        return "Your account is deactivated. Please contact support.";
      }

      return "Invalid email or/and password";
    }
    throw error;
  }
}
