// app/ui/site-footer.tsx

import Link from "next/link";
import Image from "next/image";

type SiteFooterProps = {
  /** "public" shows Sign in / Get started; "app" shows library links */
  variant?: "public" | "app";
};

export default function SiteFooter({ variant = "public" }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Link
              href={variant === "app" ? "/dashboard" : "/"}
              className="inline-flex items-center gap-2"
            >
              <Image
                src="/images/logo.png"
                alt="Series Tracker"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Series<span className="text-brand-600">Tracker</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Track movies and TV series episode by episode. One personal
              library.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {variant === "public" ? (
                  <>
                    <li>
                      <Link
                        href="/#popular"
                        className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        Discover
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/signup"
                        className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        Get started
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/login"
                        className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        Sign in
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/dashboard"
                        className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        Overview
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/tvSeries"
                        className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        Library
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/discover"
                        className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        Discover
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/profile"
                        className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        Profile
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Data
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                  >
                    TMDB
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                This product uses the TMDB API but is not endorsed or certified
                by TMDB.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:flex-row">
          <p>© {year} Series Tracker. All rights reserved.</p>
          <p>Movies & TV · Episode-level tracking</p>
        </div>
      </div>
    </footer>
  );
}
