// app/components/landing/hero.tsx

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/logo.png"
              alt="Series Tracker"
              width={112}
              height={112}
              className="object-contain"
              priority
            />
          </div>

          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
            <SparklesIcon className="h-3.5 w-3.5 text-brand-500" />
            Movies + TV · Episode-level tracking
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
            Finish what you start
            <span className="mt-1 block bg-gradient-to-r from-brand-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
              movies &amp; series
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 dark:text-slate-400 sm:text-lg">
            One library for films and shows. Track every episode, mark movies
            watched, and never lose your place again.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Get started free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Free · No credit card · Browse titles without an account
          </p>
        </div>
      </div>
    </div>
  );
}
