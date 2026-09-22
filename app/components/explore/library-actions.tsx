// app/components/explore/library-actions.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { addSeries, addMovie, getLibraryEntryId } from "@/app/lib/series";
import clsx from "clsx";

type MediaType = "tv" | "movie";

type Props = {
  mediaType: MediaType;
  tmdbId: string | number;
  data: any;
};

export default function ExploreLibraryActions({
  mediaType,
  tmdbId,
  data,
}: Props) {
  const router = useRouter();
  const id = Number(tmdbId);

  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLibrary = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) return;
    try {
      const entryId = await getLibraryEntryId(id, mediaType);
      setLibraryId(entryId);
    } catch {
      setLibraryId(null);
    }
  }, [id, mediaType]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await res.json();
        if (cancelled) return;
        const ok = !!session?.user?.id;
        setLoggedIn(ok);
        if (ok) await refreshLibrary();
      } catch {
        if (!cancelled) setLoggedIn(false);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshLibrary]);

  const handleAdd = async () => {
    if (busy || !loggedIn) return;
    setBusy(true);
    setError(null);

    try {
      if (mediaType === "movie") {
        const result = await addMovie({
          tmdbId: data.id ?? id,
          name: data.name || data.title,
          overview: data.overview,
          posterPath: data.posterPath,
          backdropPath: data.backdropPath,
          voteAverage: data.voteAverage,
          voteCount: data.voteCount,
          releaseDate: data.releaseDate,
          runtime: data.runtime,
          genres: data.genres,
          status: data.status,
          tagline: data.tagline,
          originalName: data.originalName,
          originalLanguage: data.originalLanguage,
          popularity: data.popularity,
        });

        if (result.duplicate) {
          await refreshLibrary();
          setError(result.error || "Already in your library");
          return;
        }
        if (!result.success) {
          setError(result.error || "Failed to add");
          return;
        }
        if (result.seriesId) {
          router.push(`/dashboard/movie/${result.seriesId}`);
          return;
        }
      } else {
        const result = await addSeries(
          data.id ?? id,
          data.name,
          data.totalSeasons || 0,
          [],
          data.posterPath,
          data.backdropPath,
          data.overview,
          data.voteAverage,
          data.voteCount,
          data.firstAirDate,
          data.lastAirDate,
          data.genres,
          data.status,
          data.tagline,
          data.originalName,
          data.originalLanguage,
          data.popularity,
          data.inProduction,
          data.networks,
          data.totalEpisodes,
          data.seasons,
        );

        if (result.duplicate) {
          await refreshLibrary();
          setError(result.error || "Already in your library");
          return;
        }
        if (!result.success) {
          setError(result.error || "Failed to add");
          return;
        }
        if (result.seriesId) {
          router.push(`/dashboard/myLibrary/${result.seriesId}`);
          return;
        }
      }

      await refreshLibrary();
      window.dispatchEvent(new CustomEvent("series-added"));
    } catch (e) {
      console.error(e);
      setError("Failed to add. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="mt-6 h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    );
  }

  // Guest
  if (!loggedIn) {
    return (
      <div className="mt-6">
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/signup?next=/explore/${mediaType}/${tmdbId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add to library
          </Link>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/explore/${mediaType}/${tmdbId}`)}`}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // Logged in — already owned
  if (libraryId) {
    const href =
      mediaType === "movie"
        ? `/dashboard/movie/${libraryId}`
        : `/dashboard/myLibrary/${libraryId}`;

    return (
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <CheckIcon className="h-4 w-4" />
          In library — open
        </Link>
        <Link
          href="/dashboard/myLibrary"
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          View library
        </Link>
      </div>
    );
  }

  // Logged in — can add
  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={busy}
        onClick={handleAdd}
        className={clsx(
          "inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:opacity-50",
        )}
      >
        <PlusIcon className="h-4 w-4" />
        {busy ? "Adding…" : "Add to library"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
