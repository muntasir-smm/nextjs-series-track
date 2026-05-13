// app/login/page.tsx

import LoginForm from "@/app/ui/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative mx-auto flex w-full max-w-[450px] flex-col space-y-2.5 p-6">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-600"></div>
          <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-purple-200 opacity-20 blur-3xl dark:bg-purple-600"></div>
        </div>

        {/* Logo/Brand Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <svg
              className="h-12 w-12 text-white"
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
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Series Tracker
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Track your favorite TV series and never miss an episode
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
