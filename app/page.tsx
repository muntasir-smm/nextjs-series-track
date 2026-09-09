// app/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  FilmIcon,
  SparklesIcon,
  ChartBarIcon,
  StarIcon,
  TvIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

interface PopularItem {
  id: string;
  tmdbId?: number;
  mediaType?: "tv" | "movie";
  name: string;
  posterPath: string | null;
  voteAverage: number;
  firstAirDate?: string | null;
  releaseDate?: string | null;
  overview?: string | null;
  totalSeasons?: number;
}

interface FeaturedSeries {
  id: string;
  seriesId: string;
  name: string;
  posterPath: string | null;
  reason: string;
  tmdbId?: number | null;
}

const CACHE_DURATION = 60 * 60 * 1000;

export default function LandingPage() {
  const [popularSeries, setPopularSeries] = useState<PopularItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<PopularItem[]>([]);
  const [featuredSeries, setFeaturedSeries] = useState<FeaturedSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("popularMedia");
    const cachedTime = localStorage.getItem("popularMediaTime");

    if (
      cached &&
      cachedTime &&
      Date.now() - parseInt(cachedTime) < CACHE_DURATION
    ) {
      try {
        const data = JSON.parse(cached);
        setPopularSeries(data.series || []);
        setPopularMovies(data.movies || []);
        setIsLoading(false);
      } catch {
        /* fall through to fetch */
      }
    }

    const fetchPopular = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const response = await fetch("/api/public/popular", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const series = data?.series || [];
        const movies = data?.movies || [];

        localStorage.setItem(
          "popularMedia",
          JSON.stringify({ series, movies }),
        );
        localStorage.setItem("popularMediaTime", Date.now().toString());
        setPopularSeries(series);
        setPopularMovies(movies);
        setError(null);
      } catch (err) {
        console.error("Error fetching popular:", err);
        if (cached) {
          try {
            const data = JSON.parse(cached);
            setPopularSeries(data.series || []);
            setPopularMovies(data.movies || []);
            setError("Showing cached titles — may be outdated");
          } catch {
            setError("Unable to load popular titles. Please try again later.");
          }
        } else {
          setError("Unable to load popular titles. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopular();

    const fetchFeatured = async () => {
      try {
        const response = await fetch("/api/public/featured");
        if (!response.ok) throw new Error("Failed to load featured");
        const data = await response.json();
        setFeaturedSeries(data?.series || []);
      } catch (err) {
        console.error("Error fetching featured:", err);
        setFeaturedSeries([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const getPosterUrl = (posterPath: string | null, size = "w342") => {
    if (!posterPath) return null;
    if (posterPath.startsWith("http")) return posterPath;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  };

  const formatYear = (dateString?: string | null) => {
    if (!dateString) return null;
    const year = new Date(dateString).getFullYear();
    return Number.isNaN(year) ? null : year;
  };

  const ratingLabel = (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n.toFixed(1);
  };

  const MediaCard = ({
    item,
    href,
    badge,
  }: {
    item: PopularItem;
    href: string;
    badge?: string;
  }) => {
    const posterUrl = getPosterUrl(item.posterPath);
    const year = formatYear(item.firstAirDate || item.releaseDate);
    const rating = ratingLabel(item.voteAverage);
    const seasons =
      item.totalSeasons && item.totalSeasons > 0 ? item.totalSeasons : null;

    return (
      <Link
        href={href}
        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={item.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 16vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-violet-600">
              <span className="text-2xl font-bold text-white">
                {item.name.charAt(0)}
              </span>
            </div>
          )}

          {rating && (
            <div className="absolute right-2 top-2 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
              ★ {rating}
            </div>
          )}

          {badge && (
            <div className="absolute left-2 top-2 rounded-lg bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {badge}
            </div>
          )}

          {seasons != null && (
            <div className="absolute bottom-2 left-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {seasons} season{seasons === 1 ? "" : "s"}
            </div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
            {item.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {year ?? (item.mediaType === "movie" ? "Movie" : "TV")}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
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

      {/* Features */}
      <div className="border-y border-slate-100 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Built for real watching habits
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              Not just another list — track progress the way you actually watch
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ListBulletIcon,
                color: "bg-brand-500",
                title: "Episode checklist",
                desc: "Mark individual episodes, not only whole seasons",
              },
              {
                icon: FilmIcon,
                color: "bg-violet-500",
                title: "Movies & TV",
                desc: "One personal library for films and series",
              },
              {
                icon: ClockIcon,
                color: "bg-emerald-500",
                title: "Never lose your place",
                desc: "Pick up exactly where you left off",
              },
              {
                icon: ChartBarIcon,
                color: "bg-orange-500",
                title: "Clear progress",
                desc: "See what you’ve finished and what’s next",
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

      {/* Featured */}
      {!isFeaturedLoading && featuredSeries.length > 0 && (
        <div className="bg-slate-50 py-16 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                <StarIcon className="h-4 w-4" />
                Editor&apos;s picks
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Featured series
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
                Hand-picked shows worth starting
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {featuredSeries.map((series) => {
                const href = series.tmdbId
                  ? `/explore/tv/${series.tmdbId}`
                  : "/signup";
                return (
                  <MediaCard
                    key={series.id}
                    href={href}
                    badge="Featured"
                    item={{
                      id: series.id,
                      name: series.name,
                      posterPath: series.posterPath,
                      voteAverage: 0,
                      overview: series.reason,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Popular TV */}
      <div className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 dark:text-sky-400">
                <TvIcon className="h-4 w-4" />
                TV series
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Popular series right now
              </h2>
              <p className="mt-2 max-w-xl text-slate-500 dark:text-slate-400">
                Tap a poster for full details — add to your library after you
                sign up
              </p>
            </div>
            <Link
              href="/signup"
              className="mt-4 hidden text-sm font-semibold text-brand-600 hover:underline sm:inline dark:text-brand-400"
            >
              Track free →
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
            </div>
          ) : error && popularSeries.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Try again
              </button>
            </div>
          ) : popularSeries.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {popularSeries.slice(0, 12).map((series) => (
                <MediaCard
                  key={`tv-${series.id}`}
                  item={{ ...series, mediaType: "tv" }}
                  href={`/explore/tv/${series.tmdbId || series.id}`}
                />
              ))}
            </div>
          ) : null}

          {error && popularSeries.length > 0 && (
            <p className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Popular Movies */}
      <div className="bg-slate-50 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400">
                <FilmIcon className="h-4 w-4" />
                Movies
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Popular movies
              </h2>
              <p className="mt-2 max-w-xl text-slate-500 dark:text-slate-400">
                Films trending worldwide — open any title, track it when you
                join
              </p>
            </div>
            <Link
              href="/signup"
              className="mt-4 hidden text-sm font-semibold text-brand-600 hover:underline sm:inline dark:text-brand-400"
            >
              Track free →
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
            </div>
          ) : popularMovies.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {popularMovies.slice(0, 12).map((movie) => (
                <MediaCard
                  key={`movie-${movie.id}`}
                  item={{ ...movie, mediaType: "movie" }}
                  href={`/explore/movie/${movie.tmdbId || movie.id}`}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Start tracking free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Social proof strip */}
      <div className="border-y border-slate-100 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Episode-level for TV
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Not just seasons — every episode
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Movies included
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Watched status in the same library
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Free to start
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Browse now, track after signup
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to track smarter?
          </h2>
          <p className="mt-3 text-lg text-brand-100">
            Create your free account and build a library you&apos;ll actually
            finish.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            Create free account
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
