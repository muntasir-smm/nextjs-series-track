// app/ui/login-form.tsx

"use client";

import { useState } from "react";
import { lusitana } from "@/app/ui/fonts";
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "./button";
import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/app/lib/actions";
import Link from "next/link";

export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={dispatch} className="space-y-4">
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl dark:bg-gray-800/80 px-8 pb-8 pt-6 transition-all">
        <h2
          className={`${lusitana.className} mb-6 text-2xl font-semibold text-gray-800 dark:text-white`}
        >
          Welcome back!
        </h2>

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
        {errorMessage && (
          <div
            className="mt-4 flex items-center space-x-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20"
            aria-live="polite"
            aria-atomic="true"
          >
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
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
