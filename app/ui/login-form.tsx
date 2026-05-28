"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { lusitana } from "@/app/ui/fonts";
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "./button";
import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/app/lib/actions";
import Link from "next/link";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check for success message from URL
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  // Handle custom error message from authenticate
  useEffect(() => {
    if (
      errorMessage &&
      typeof errorMessage === "string" &&
      errorMessage.startsWith("not_approved:")
    ) {
      const email = errorMessage.split(":")[1];
      setPendingMessage(
        `Your account (${email}) is pending admin approval. You'll be able to sign in once approved.`,
      );
      setPendingEmail(email);
      // Clear after 8 seconds
      setTimeout(() => {
        setPendingMessage(null);
        setPendingEmail(null);
      }, 8000);
    }
  }, [errorMessage]);

  const getDisplayErrorMessage = () => {
    if (!errorMessage) return null;
    if (
      typeof errorMessage === "string" &&
      errorMessage.startsWith("not_approved:")
    )
      return null;
    return errorMessage;
  };

  const displayError = getDisplayErrorMessage();

  return (
    <form action={dispatch} className="space-y-4">
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl dark:bg-gray-800/80 px-8 pb-8 pt-6 transition-all">
        <h2
          className={`${lusitana.className} mb-6 text-2xl font-semibold text-gray-800 dark:text-white`}
        >
          Welcome back!
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Pending Approval Message */}
        {pendingMessage && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-3 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <ClockIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Account Pending Approval
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                  {pendingMessage}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Please wait for an admin to approve your account.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="w-full space-y-5">
          {/* Email Field */}
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative group">
              <input
                className="peer block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:bg-gray-700"
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                defaultValue={pendingEmail || ""}
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors peer-focus:text-blue-500" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="password"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <input
                className="peer block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-11 pr-11 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:bg-gray-700"
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors peer-focus:text-blue-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="mt-6 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              name="remember"
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            Remember me
          </label>
          <Link
            href="/signup"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
          >
            Create account
          </Link>
        </div>

        <LoginButton />

        {/* Error Message */}
        {displayError && (
          <div
            className="mt-4 flex items-center space-x-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20"
            aria-live="polite"
            aria-atomic="true"
          >
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {displayError ===
              "Your account has been banned. Please contact support."
                ? "Your account has been banned. Please contact support."
                : displayError ===
                    "Your account is deactivated. Please contact support."
                  ? "Your account is deactivated. Please contact support."
                  : displayError}
            </p>
          </div>
        )}
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      variant="gradient"
      size="lg"
      className="mt-6 w-full py-3"
      isLoading={pending}
      disabled={pending}
    >
      {pending ? (
        "Signing in..."
      ) : (
        <>
          Sign In
          <ArrowRightIcon className="h-5 w-5" />
        </>
      )}
    </Button>
  );
}
