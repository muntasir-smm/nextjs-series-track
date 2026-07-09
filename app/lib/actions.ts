// app/lib/actions.ts

"use server";

import { signIn } from "@/app/lib/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "Invalid email or password";
      }

      if (error.cause?.err?.message === "banned") {
        return "Your account has been banned. Please contact support.";
      }

      if (error.cause?.err?.message === "inactive") {
        return "Your account is deactivated. Please contact support.";
      }

      if (error.cause?.err?.message === "not_approved") {
        const email = formData.get("email");
        return `not_approved:${email}`;
      }

      return "Invalid email or password";
    }
    throw error;
  }
}
