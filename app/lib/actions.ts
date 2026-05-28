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
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      // Handle specific error types
      if (error.type === "CredentialsSignin") {
        return "Invalid email or password";
      }

      // Check for custom error messages from your authorize function
      if (error.cause?.err?.message === "banned") {
        return "Your account has been banned. Please contact support.";
      }

      if (error.cause?.err?.message === "inactive") {
        return "Your account is deactivated. Please contact support.";
      }

      if (error.cause?.err?.message === "not_approved") {
        // Get email from formData to include in return
        const email = formData.get("email");
        return `not_approved:${email}`;
      }

      return "Invalid email or password";
    }
    throw error;
  }
}
