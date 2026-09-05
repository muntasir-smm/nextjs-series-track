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
import { authenticate } from "@/app/lib/actions";
import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export function useExitTransition() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const navigateTo = useCallback(
    (href: string) => {
      if (isExiting) return;
      setIsExiting(true);
      setTimeout(() => router.push(href), 480);
    },
    [isExiting, router],
  );

  return { isExiting, navigateTo };
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
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

  const displayError =
    errorMessage &&
    typeof errorMessage === "string" &&
    !errorMessage.startsWith("not_approved:")
      ? errorMessage
      : null;

  return (
    <form action={dispatch} className="w-full">
      <div
        style={{
          opacity: isExiting ? 0 : 1,
          transform: isExiting
            ? "translateX(-32px) scale(0.98)"
            : "translateX(0) scale(1)",
          transition:
            "opacity 0.4s cubic-bezier(0.4, 0, 1, 1), transform 0.4s cubic-bezier(0.4, 0, 1, 1)",
        }}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft-lg dark:border-slate-800 dark:bg-slate-900 md:p-7"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to continue tracking
            </p>
          </div>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Success!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Pending */}
        {pendingMessage && (
          <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/30">
            <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Account Pending Approval
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {pendingMessage}
              </p>
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Email Address
            </label>
            <div className="relative">
              <AtSymbolIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@email.com"
                required
                defaultValue={pendingEmail || ""}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                minLength={6}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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

        {/* Remember + Create */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              name="remember"
              className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("/signup");
            }}
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Create account
          </button>
        </div>

        {/* Error */}
        {displayError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
            <p className="text-xs font-medium">{displayError}</p>
          </div>
        )}

        <LoginButton />

        <p className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("/signup");
            }}
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Create one now
          </button>
        </p>
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
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-70"
    >
      {pending ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
