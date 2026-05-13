// app/page.tsx

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl text-center space-y-8">
        {/* Logo/Brand */}
        <div className="flex justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl">
            <svg
              className="h-16 w-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>

        {/* Hero Text */}
        <div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Series Tracker
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Track your favorite TV series, manage watchlists, and never miss an
            episode.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600 md:text-base"
          >
            <span>Get Started</span>
            <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 md:text-base"
          >
            <span>Sign In</span>
          </Link>
        </div>

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-3 pt-12">
          <div className="rounded-lg bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Track Series
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Keep track of all your favorite TV shows in one place
            </p>
          </div>
          <div className="rounded-lg bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Watchlist
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create watchlists for series you plan to watch
            </p>
          </div>
          <div className="rounded-lg bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Never Miss
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Get updates on new episodes and seasons
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
