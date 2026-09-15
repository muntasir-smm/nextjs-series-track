// app/dashboard/discover/page.tsx

"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  SparklesIcon,
  ArrowPathIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { getUserSeries } from "@/app/lib/series";
import { addToLibrary } from "@/app/lib/add-to-library";
import { libraryKey } from "@/app/lib/library-key";
import { useDebouncedCallback } from "use-debounce";

import {
  normalizeResults,
  buildUrl,
  type MediaTypeFilter,
  type DiscoverItem,
  type TmdbListResponse,
} from "./utils";
import { DiscoverCard } from "./components/discover-card";
import { SearchInput } from "./components/search-input";
import { MediaTypeTabs } from "./components/media-type-tabs";
import {
  MessageBanner,
  type Message,
  type MessageKind,
} from "./components/message-banner";
import { DiscoverSkeleton } from "./components/discover-skeleton";

export default function DiscoverPage() {
  const [mediaType, setMediaType] = useState<MediaTypeFilter>("all");
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [libraryMap, setLibraryMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadMoreNodeRef = useRef<HTMLDivElement>(null);
  const loadMoreFnRef = useRef<() => void>(() => {});
  const fetchAbortRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef(0);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingMoreRef = useRef(false);

  const showMessage = useCallback((kind: MessageKind, text: string) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setMessage({ kind, text });
    messageTimerRef.current = setTimeout(() => {
      setMessage(null);
      messageTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      fetchAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > 500);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadLibraryMap = useCallback(async () => {
    try {
      const lib = await getUserSeries();
      const map = new Map<string, string>();
      for (const s of lib) {
        if (s.tmdbId == null) continue;
        map.set(libraryKey(s.mediaType || "tv", s.tmdbId), s.id);
      }
      setLibraryMap(map);
    } catch (e) {
      console.error("Failed to load library map:", e);
    }
  }, []);

  useEffect(() => {
    loadLibraryMap();
  }, [loadLibraryMap]);

  const itemsRef = useRef<DiscoverItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const fetchPage = useCallback(
    async (
      query: string,
      page: number,
      type: MediaTypeFilter,
      append: boolean,
    ): Promise<boolean> => {
      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;
      const myId = ++fetchIdRef.current;

      try {
        const res = await fetch(buildUrl(query, page, type), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data: TmdbListResponse = await res.json();

        if (myId !== fetchIdRef.current) return false;

        const next = normalizeResults(data, type);

        let unique = next;
        if (append) {
          const seen = new Set(
            itemsRef.current.map((i) => libraryKey(i.mediaType, i.tmdbId)),
          );
          unique = next.filter((i) => {
            const k = libraryKey(i.mediaType, i.tmdbId);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          setItems((prev) => [...prev, ...unique]);
        } else {
          setItems(next);
        }

        const totalPages = data.totalPages ?? data.total_pages;
        if (typeof totalPages === "number" && totalPages > 0) {
          setHasMore(page < totalPages);
        } else {
          setHasMore(next.length >= 12 && (!append || unique.length > 0));
        }
        return true;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return false;
        console.error("Fetch failed:", err);
        if (myId === fetchIdRef.current) {
          showMessage("error", "Failed to load. Please try again.");
        }
        return false;
      }
    },
    [showMessage],
  );

  const debouncedSearch = useDebouncedCallback(
    async (query: string, type: MediaTypeFilter) => {
      setIsSearching(true);
      setCurrentPage(1);
      try {
        await fetchPage(query, 1, type, false);
      } finally {
        setIsSearching(false);
      }
    },
    500,
  );

  useEffect(() => {
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setSearchQuery("");
    setIsLoading(true);
    (async () => {
      await fetchPage("", 1, mediaType, false);
      setIsLoading(false);
    })();
  }, [mediaType, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || isSearching) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = currentPage + 1;
    const ok = await fetchPage(searchQuery, nextPage, mediaType, true);
    if (ok) setCurrentPage(nextPage);

    setIsLoadingMore(false);
    loadingMoreRef.current = false;
  }, [hasMore, isSearching, currentPage, searchQuery, mediaType, fetchPage]);

  useEffect(() => {
    loadMoreFnRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    if (isLoading || items.length === 0) return;
    const node = loadMoreNodeRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreFnRef.current();
      },
      { threshold: 0.1, rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoading, items.length > 0]);

  const handleAdd = useCallback(
    async (item: DiscoverItem) => {
      const key = libraryKey(item.mediaType, item.tmdbId);
      if (libraryMap.has(key)) {
        showMessage("info", "Already in your library");
        return;
      }

      setAddingKey(key);
      const result = await addToLibrary(item.mediaType, item.tmdbId);

      if (result.duplicate) {
        if (result.seriesId) {
          setLibraryMap((prev) => new Map(prev).set(key, result.seriesId!));
        } else {
          await loadLibraryMap();
        }
        showMessage("info", result.error || "Already in your library");
      } else if (result.success) {
        if (result.seriesId) {
          setLibraryMap((prev) => new Map(prev).set(key, result.seriesId!));
        } else {
          await loadLibraryMap();
        }
        showMessage("success", `Added “${result.name ?? item.name}”`);
        window.dispatchEvent(new CustomEvent("series-added"));
      } else {
        showMessage("error", result.error || "Failed to add");
      }
      setAddingKey(null);
    },
    [libraryMap, showMessage, loadLibraryMap],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedSearch(value, mediaType);
    },
    [debouncedSearch, mediaType],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchPage("", 1, mediaType, false);
  }, [fetchPage, mediaType]);

  const searchPlaceholder = useMemo(() => {
    if (mediaType === "movie") return "Search movies...";
    if (mediaType === "tv") return "Search TV series...";
    return "Search movies & TV...";
  }, [mediaType]);

  return (
    <div className="space-y-6">
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 md:bottom-8"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/40">
            <SparklesIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Discover
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Browse and add movies &amp; TV series
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            placeholder={searchPlaceholder}
          />
          <MediaTypeTabs value={mediaType} onChange={setMediaType} />
        </div>
      </div>

      {isSearching && (
        <div className="flex items-center justify-center gap-2 py-1 text-sm text-slate-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-brand-500" />
          Searching...
        </div>
      )}

      {message && (
        <MessageBanner message={message} onDismiss={() => setMessage(null)} />
      )}

      {isLoading ? (
        <DiscoverSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery
              ? `No results for “${searchQuery}”. Try another search.`
              : "Nothing to show right now."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
            {items.map((item) => {
              const key = libraryKey(item.mediaType, item.tmdbId);
              return (
                <DiscoverCard
                  key={key}
                  item={item}
                  isAdding={addingKey === key}
                  librarySeriesId={libraryMap.get(key)}
                  onAdd={handleAdd}
                />
              );
            })}
          </div>

          <div ref={loadMoreNodeRef} className="py-8 text-center">
            {isLoadingMore && (
              <ArrowPathIcon className="mx-auto h-5 w-5 animate-spin text-brand-500" />
            )}
            {hasMore && !isLoadingMore && (
              <button
                type="button"
                onClick={loadMore}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Load more
              </button>
            )}
            {!hasMore && items.length > 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                You&apos;ve reached the end.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
