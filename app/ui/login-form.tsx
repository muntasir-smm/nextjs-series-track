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
import { ArrowRightIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
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
            href="/register"
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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white/80 px-3 text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          Signing in...
        </span>
      ) : (
        <>
          Sign In
          <ArrowRightIcon className="h-5 w-5" />
        </>
      )}
    </Button>
  );
}
