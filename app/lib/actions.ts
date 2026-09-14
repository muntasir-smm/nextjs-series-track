// app/lib/actions.ts

"use server";

import { signIn } from "@/app/lib/auth";
import { AuthError } from "next-auth";

function safeRedirectPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (
    value.startsWith("/login") ||
    value.startsWith("/signup") ||
    value.startsWith("/forgot-password")
  ) {
    return "/dashboard";
  }
  return value;
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const redirectTo = safeRedirectPath(
    formData.get("callbackUrl") ?? formData.get("next"),
  );

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo,
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
