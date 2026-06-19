// app/login/page.tsx

import { Suspense } from "react";
import LoginForm from "@/app/ui/login-form";
import PageTransition from "@/app/ui/page-transition";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Welcome Back - Series Tracker",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0e17] px-4 py-12 md:py-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[60vw] h-[60vh] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-[140px] opacity-70" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[50vw] h-[50vh] bg-purple-400/10 dark:bg-purple-900/10 rounded-full blur-[140px] opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-[1100px]">
        <PageTransition direction="right">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left Side: Brand - Right Aligned on Desktop */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4 order-1">
              <div className="flex items-center gap-3 md:flex-row-reverse">
                <div className="relative h-10 w-10 flex-shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
                  Series
                  <span className="text-blue-600 dark:text-blue-500">
                    Tracker
                  </span>
                </span>
              </div>

              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tighter">
                Welcome back
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  to your watchlist.
                </span>
              </div>

              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md md:text-right">
                Continue tracking your favorite shows, discover new series, and
                never miss an episode again.
              </p>

              <div className="hidden md:flex flex-wrap gap-2 pt-2 justify-end">
                {[
                  "Continue Watching",
                  "New Episodes",
                  "Your Stats",
                  "Discover",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/50 text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full max-w-[450px] mx-auto md:mr-0 lg:max-w-none lg:w-[450px] order-2">
              <Suspense
                fallback={
                  <div className="h-[400px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
                }
              >
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </PageTransition>
      </div>

      {/* Mobile Footer */}
      <footer className="absolute bottom-5 left-0 w-full text-center md:hidden px-4">
        <p className="text-[11px] text-gray-500 dark:text-gray-600">
          By continuing, you agree to Series Tracker&apos;s{" "}
          <Link
            href="/terms"
            className="text-blue-600 dark:text-blue-500 hover:underline font-medium"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-blue-600 dark:text-blue-500 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
