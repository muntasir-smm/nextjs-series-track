// app/explore/tv/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, PlusIcon, StarIcon } from "@heroicons/react/24/solid";
import { formatRating } from "@/app/lib/format";

export default function PublicTvPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/tmdb/tv/${id}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Could not load this series.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 dark:bg-slate-950">
        <p className="text-slate-600 dark:text-slate-300">
          {error || "Not found"}
        </p>
        <Link href="/" className="text-brand-600 hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  const poster = data.posterPath
    ? `https://image.tmdb.org/t/p/w500${data.posterPath}`
    : null;
  const backdrop = data.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${data.backdropPath}`
    : null;
  const rating = formatRating(data.voteAverage);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative h-48 w-full overflow-hidden sm:h-64 md:h-72">
        {backdrop && (
          <Image src={backdrop} alt="" fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-slate-950 dark:via-slate-950/70" />
      </div>

      <div className="relative mx-auto -mt-24 max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Home
        </Link>

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="relative mx-auto h-56 w-36 shrink-0 overflow-hidden rounded-xl shadow-lg sm:mx-0 sm:h-64 sm:w-44">
            {poster ? (
              <Image
                src={poster}
                alt={data.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-200 dark:bg-slate-800">
                {data.name?.[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {data.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {rating && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <StarIcon className="h-4 w-4" /> {rating}
                </span>
              )}
              {data.totalSeasons > 0 && (
                <span>
                  {data.totalSeasons} season{data.totalSeasons === 1 ? "" : "s"}
                </span>
              )}
              {data.status && <span>· {data.status}</span>}
              {data.firstAirDate && (
                <span>· {String(data.firstAirDate).slice(0, 4)}</span>
              )}
            </div>
            {data.overview && (
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {data.overview}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/signup?next=/explore/tv/${id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <PlusIcon className="h-4 w-4" />
                Add to library — free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Create a free account to track episodes and progress.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
