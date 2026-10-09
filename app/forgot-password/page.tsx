// app/forgot-password/page.tsx

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Forgot password
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Self-service password reset is not available yet. If you can&apos;t
          sign in, ask a site administrator to reset your password from the
          Admin panel.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Back to sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
