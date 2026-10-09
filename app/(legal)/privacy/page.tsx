// app/(legal)/privacy/page.tsx

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        ← Back home
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          This policy describes what Series Tracker collects and how it is used.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          What we collect
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account details: name, email, and hashed password</li>
          <li>
            Library data: movies and series you add, watch progress, and related
            preferences
          </li>
          <li>Optional profile data such as avatar URL</li>
          <li>
            Basic activity needed to operate the Service (e.g. login time)
          </li>
        </ul>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          How we use data
        </h2>
        <p>
          Data is used to provide your library, authenticate you, and operate
          admin features. We do not sell personal data.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Third parties
        </h2>
        <p>
          Title metadata is fetched from TMDB. Hosting and database providers
          (e.g. Vercel, Neon) process data as needed to run the app.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Cookies &amp; storage
        </h2>
        <p>
          Session cookies are used for authentication. Theme preference may be
          stored in your browser (localStorage).
        </p>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Your choices
        </h2>
        <p>
          You can request account deletion or data export by contacting the site
          administrator.
        </p>
      </div>
    </main>
  );
}
