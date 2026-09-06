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
  StarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

interface PopularSeries {
  id: string;
  name: string;
  posterPath: string | null;
  voteAverage: number;
  firstAirDate: string | null;
  overview?: string | null;
  popularity?: number;
}

interface FeaturedSeries {
  id: string;
  seriesId: string;
  name: string;
  posterPath: string | null;
  reason: string;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export default function LandingPage() {
  const [popularSeries, setPopularSeries] = useState<PopularSeries[]>([]);
  const [featuredSeries, setFeaturedSeries] = useState<FeaturedSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
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
    } else {
      const fetchPopular = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch("/api/public/popular", {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();
          const seriesArray =
            data?.series || (Array.isArray(data) ? data : []);

          localStorage.setItem("popularSeries", JSON.stringify(seriesArray));
          localStorage.setItem("popularSeriesTime", Date.now().toString());
          setPopularSeries(seriesArray);
        } catch (err) {
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

      fetchPopular();
    }

    // Featured from admin (no long cache — admin can change anytime)
    const fetchFeatured = async () => {
      try {
        const response = await fetch("/api/public/featured");
        if (!response.ok) throw new Error("Failed to load featured");
        const data = await response.json();
        setFeaturedSeries(data?.series || []);
      } catch (err) {
        console.error("Error fetching featured series:", err);
        setFeaturedSeries([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const getPosterUrl = (posterPath: string | null, size: string = "w185") => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

  const formatYear = (dateString: string | null) => {
    if (!dateString) return null;
    const year = new Date(dateString).getFullYear();
    return Number.isNaN(year) ? null : year;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
             
                <Image
                  src="/images/logo.png"
                  alt="Series Tracker"
                  width={128}
                  height={128}
                  className="object-contain"
                  priority
                />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
              Track Your Favorite
              <span className="mt-1 block bg-gradient-to-r from-brand-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
                TV Series
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 dark:text-slate-400 sm:text-lg">
              Never miss an episode again. Track progress, manage your
              watchlist, and discover new series in one place.
            </p>

            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Get Started Free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
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
                desc: "Mark seasons as watched and see progress at a glance",
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
                desc: "Your own collection of series in one place",
              },
              {
                icon: ChartBarIcon,
                color: "bg-orange-500",
                title: "Watch Statistics",
                desc: "See your watching patterns and progress",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}
                >
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured from Admin */}
      {!isFeaturedLoading && featuredSeries.length > 0 && (
        <div className="bg-slate-50 py-16 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                <StarIcon className="h-4 w-4" />
                Editor&apos;s picks
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Featured Series
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
                Hand-picked shows from our team
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {featuredSeries.map((series) => {
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
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 16vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
                          <span className="text-2xl font-bold text-white">
                            {series.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute left-2 top-2 rounded-lg bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        Featured
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {series.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {series.reason}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Popular */}
      <div className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
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
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-brand-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : popularSeries.length > 0 ? (
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {popularSeries.slice(0, 12).map((series) => {
                const posterUrl = getPosterUrl(series.posterPath);
                const year = formatYear(series.firstAirDate);
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
                          className="object-cover transition duration-300 group-hover:scale-105"
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
                      {/* Year only — no fake "?" seasons */}
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {year ? `${year}` : "TV Series"}
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
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Start Tracking Free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to never miss an episode?
          </h2>
          <p className="mt-3 text-lg text-brand-100">
            Create your free account and start building your watchlist.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-600 transition hover:bg-brand-50"
          >
            Create Free Account
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}