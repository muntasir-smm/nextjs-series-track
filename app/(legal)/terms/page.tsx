// app/(legal)/terms/page.tsx

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        ← Back home
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          Series Tracker (&quot;the Service&quot;) is a personal movie and TV
          tracking application. By creating an account or using the Service, you
          agree to these terms.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Accounts
        </h2>
        <p>
          You are responsible for keeping your login credentials secure. New
          accounts may require admin approval before access is granted. Accounts
          that violate these terms may be suspended or banned.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Acceptable use
        </h2>
        <p>
          Use the Service only for lawful personal tracking. Do not attempt to
          abuse APIs, disrupt the Service, or access other users&apos; data.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Content &amp; third parties
        </h2>
        <p>
          Movie and TV metadata and images are provided via The Movie Database
          (TMDB). Series Tracker is not endorsed or certified by TMDB. We do not
          claim ownership of TMDB content.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Disclaimer
        </h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any
          kind. Features may change or become unavailable.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Contact
        </h2>
        <p>
          Questions about these terms can be directed to the site administrator.
        </p>
      </div>
    </main>
  );
}
