// app/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

interface PopularSeries {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchProgress: number;
  posterPath: string | null;
  voteAverage: number;
  firstAirDate: string;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export default function LandingPage() {
  const [popularSeries, setPopularSeries] = useState<PopularSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedData = localStorage.getItem("popularSeries");
    const cachedTime = localStorage.getItem("popularSeriesTime");

    if (
      cachedData &&
      cachedTime &&
      Date.now() - parseInt(cachedTime) < CACHE_DURATION
    ) {
      setPopularSeries(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch("/api/public/popular", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const seriesArray = data?.series || (Array.isArray(data) ? data : []);

        localStorage.setItem("popularSeries", JSON.stringify(seriesArray));
        localStorage.setItem("popularSeriesTime", Date.now().toString());
        setPopularSeries(seriesArray);
      } catch (err: any) {
        console.error("Error fetching popular series:", err);
        if (cachedData) {
          setPopularSeries(JSON.parse(cachedData));
          setError("Using cached data — results may be outdated");
        } else {
          setError("Unable to load popular series. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPosterUrl = (posterPath: string | null, size: string = "w185") => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl dark:bg-brand-600/10" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-600/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25">
                <Image
                  src="/images/logo.png"
                  alt="Series Tracker"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
              Track Your Favorite
              <span className="mt-1 block bg-gradient-to-r from-brand-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
                TV Series
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 dark:text-slate-400 sm:text-lg md:text-xl">
              Never miss an episode again. Track your watch progress, manage
              your watchlist, and discover new series all in one place.
            </p>

            <div className="mt-5 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-sm text-slate-600 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
                <SparklesIcon className="h-4 w-4 text-amber-500" />
                <span>Join trackers worldwide</span>
              </div>
            </div>

            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 hover:shadow-md"
              >
                Get Started Free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16 dark:bg-slate-900 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Features you&apos;ll love
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              Everything you need to manage your TV series habit
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CheckCircleIcon,
                color: "bg-brand-500",
                title: "Track Progress",
                desc: "Mark seasons as watched and see your progress at a glance",
              },
              {
                icon: ClockIcon,
                color: "bg-violet-500",
                title: "Upcoming Seasons",
                desc: "Never miss when your favorite shows return",
              },
              {
                icon: UserGroupIcon,
                color: "bg-emerald-500",
                title: "Personal Library",
                desc: "Your own personal collection of series",
              },
              {
                icon: ChartBarIcon,
                color: "bg-orange-500",
                title: "Watch Statistics",
                desc: "See your watching patterns and progress",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:shadow-soft dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Series */}
      <div className="bg-slate-50 py-16 dark:bg-slate-950 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Popular Series Right Now
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              Trending shows loved by audiences worldwide
            </p>
          </div>

          {isLoading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="mt-12 text-center">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Try again
              </button>
            </div>
          ) : popularSeries.length > 0 ? (
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {popularSeries.slice(0, 12).map((series) => {
                const posterUrl = getPosterUrl(series.posterPath);
                return (
                  <div
                    key={series.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft-lg dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden">
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt={series.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 16vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
                          <span className="text-2xl font-bold text-white">
                            {series.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {series.voteAverage > 0 && (
                        <div className="absolute right-2 top-2 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-amber-400 backdrop-blur-sm">
                          ★ {series.voteAverage.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {series.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {series.totalSeasons || "?"} seasons
                        {series.firstAirDate
                          ? ` · ${new Date(series.firstAirDate).getFullYear()}`
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Start Tracking Free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Ready to never miss an episode?
          </h2>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
            Create your free account and start building your watchlist today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700"
            >
              Create Free Account
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Series Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
