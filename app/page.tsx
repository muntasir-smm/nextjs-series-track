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

export default function LandingPage() {
  const [popularSeries, setPopularSeries] = useState<PopularSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tmdb/popular")
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array
        const seriesArray = data?.series || (Array.isArray(data) ? data : []);
        setPopularSeries(seriesArray);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching popular series:", error);
        setPopularSeries([]); // Set empty array on error
        setIsLoading(false);
      });
  }, []);

  const getPosterUrl = (posterPath: string | null, size: string = "w342") => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).getFullYear();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            {/* Logo with Animation */}
            <div className="flex justify-center mb-6 animate-bounce">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <svg
                  className="h-10 w-10 text-white"
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

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Track Your Favorite
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TV Series
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
              Never miss an episode again. Track your watch progress, manage
              your watchlist, and discover new series all in one place.
            </p>

            {/* Stats Badge */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-gray-600 backdrop-blur-sm dark:bg-gray-800/80">
                <SparklesIcon className="h-4 w-4 text-yellow-500" />
                <span>Join 1,000+ happy trackers</span>
              </div>
            </div>

            <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/signup"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-base font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg md:py-4 md:px-10 md:text-lg"
                >
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-3 sm:ml-3 sm:mt-0">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 md:py-4 md:px-10 md:text-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Features you&apos;ll love
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              Everything you need to manage your TV series addiction
            </p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-6 transition-all hover:shadow-lg dark:bg-gray-800">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-blue-500">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Track Progress
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Mark seasons as watched and see your progress at a glance
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 transition-all hover:shadow-lg dark:bg-gray-800">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-purple-500">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Upcoming Seasons
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Never miss when your favorite shows return
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 transition-all hover:shadow-lg dark:bg-gray-800">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-green-500">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Personal Library
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Your own personal collection of series
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 transition-all hover:shadow-lg dark:bg-gray-800">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-orange-500">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Watch Statistics
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  See your watching patterns and progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Series Section - Real TMDB Data */}
      <div className="bg-gray-50 dark:bg-gray-800 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              🔥 Popular Series Right Now
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              Trending shows loved by audiences worldwide
            </p>
          </div>

          {isLoading ? (
            <div className="mt-10 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : popularSeries.length > 0 ? (
            <>
              <div className="mt-10 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                {popularSeries.slice(0, 18).map((series) => {
                  const posterUrl = getPosterUrl(series.posterPath);
                  return (
                    <div
                      key={series.id}
                      className="group rounded-lg bg-white shadow transition-all hover:shadow-xl dark:bg-gray-900"
                    >
                      {/* Poster Image */}
                      <div className="relative overflow-hidden rounded-t-lg">
                        {posterUrl ? (
                          <div className="relative h-64 w-full">
                            <Image
                              src={posterUrl}
                              alt={series.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                            <span className="text-lg font-bold text-white">
                              {series.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        {/* Vote Badge */}
                        {series.voteAverage > 0 && (
                          <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-yellow-400">
                            ⭐ {series.voteAverage.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {series.name}
                        </h3>
                        <div className="mt-1 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{series.totalSeasons || "?"} seasons</span>
                          <span>{formatDate(series.firstAirDate)}</span>
                        </div>

                        {/* Popularity Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Popularity</span>
                            <span>
                              {series.voteAverage > 0
                                ? `${Math.round(series.voteAverage * 10)}%`
                                : "Trending"}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                              style={{
                                width:
                                  series.voteAverage > 0
                                    ? `${series.voteAverage * 10}%`
                                    : "75%",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  See more trending shows
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Unable to load popular series at the moment. Please try again
                later.
              </p>
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Join now to track your favorite shows and get personalized
              recommendations!
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Loved by TV enthusiasts
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
              See what our users are saying
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">
                &ldquo;Finally, a simple way to track all my shows! The progress
                bar keeps me motivated to catch up.&rdquo;
              </p>
              <p className="mt-4 font-medium text-gray-900 dark:text-white">
                — Sarah J.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">
                &ldquo;Love the TMDB integration! Adding new series is super
                fast with automatic posters and descriptions.&rdquo;
              </p>
              <p className="mt-4 font-medium text-gray-900 dark:text-white">
                — Mike R.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">
                &ldquo;The upcoming seasons feature helps me know exactly when
                my favorite shows return. Can&apos;t live without it!&rdquo;
              </p>
              <p className="mt-4 font-medium text-gray-900 dark:text-white">
                — Emily T.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to start tracking?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-blue-100">
              Join now and never miss an episode again.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-blue-600 transition-all hover:bg-blue-50 hover:shadow-lg"
              >
                Create Free Account
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
