// app/ui/login-form.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/app/lib/actions";
import Image from "next/image";

/** Shared exit-transition helper: animate out, then navigate */
export function useExitTransition() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const navigateTo = useCallback(
    (href: string) => {
      if (isExiting) return;
      setIsExiting(true);
      // Match the duration in PageTransition (450 ms) with a small buffer
      setTimeout(() => router.push(href), 480);
    },
    [isExiting, router],
  );

  return { isExiting, navigateTo };
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { isExiting, navigateTo } = useExitTransition();

  useEffect(() => {
    const message = searchParams?.get("message");
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

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

  const handleSignUpRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo("/signup");
  };

  return (
    <form action={dispatch} className="w-full">
      <div
        style={{
          opacity: isExiting ? 0 : 1,
          transform: isExiting
            ? "translateX(-40px) scale(0.97)"
            : "translateX(0) scale(1)",
          transition:
            "opacity 0.4s cubic-bezier(0.4, 0, 1, 1), transform 0.4s cubic-bezier(0.4, 0, 1, 1)",
          willChange: "opacity, transform",
        }}
        className="bg-white dark:bg-gray-950 p-5 md:p-7 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border-t-2 border-l-2 border-gradient-from-blue-500-to-purple-600 dark:border-gray-800 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Sign in to continue tracking
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3.5 flex gap-2.5 animate-in slide-in-from-top duration-300">
            <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                Success!
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Pending Approval Message */}
        {pendingMessage && (
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-3.5 flex gap-2.5">
            <ClockIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Account Pending Approval
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                {pendingMessage}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Please wait for an admin to approve your account.
              </p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-3.5">
          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-800 dark:text-gray-300"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500">
                <AtSymbolIcon className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@email.com"
                required
                defaultValue={pendingEmail || ""}
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-800 dark:text-gray-300"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500">
                <KeyIcon className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              name="remember"
              className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 h-3.5 w-3.5"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={handleSignUpRedirect}
            className="text-xs text-blue-600 dark:text-blue-500 font-semibold hover:underline transition-colors"
          >
            Create account
          </button>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/80 p-2.5 flex items-center gap-2 text-red-700 dark:text-red-400">
            <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs font-medium">
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

        {/* Submit Button */}
        <LoginButton />

        {/* Footer */}
        <div className="text-center pt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={handleSignUpRedirect}
              className="text-blue-600 dark:text-blue-500 font-semibold hover:underline transition-colors"
            >
              Create one now
            </button>
          </p>
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 disabled:opacity-70 flex items-center justify-center gap-2.5 text-sm shadow-md shadow-blue-500/20 dark:shadow-blue-500/10 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
    >
      {pending ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Signing in...
        </>
      ) : (
        <>
          Sign In
          <ArrowRightIcon className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
