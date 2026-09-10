// app/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/app/components/landing/hero";
import { Features } from "@/app/components/landing/features";
import { FeaturedSection } from "@/app/components/landing/featured-section";
import { PopularSection } from "@/app/components/landing/popular-section";
import { SocialProof } from "@/app/components/landing/social-proof";
import { FinalCta } from "@/app/components/landing/final-cta";
import type {
  FeaturedSeries,
  PopularItem,
} from "@/app/components/landing/types";
import PublicNavbar from "@/app/ui/public-navbar";
import SiteFooter from "@/app/ui/site-footer";

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
        /* fetch below */
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
        console.error(err);
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

    fetch("/api/public/featured")
      .then((r) => r.json())
      .then((data) => setFeaturedSeries(data?.series || []))
      .catch(() => setFeaturedSeries([]))
      .finally(() => setIsFeaturedLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <FeaturedSection items={featuredSeries} loading={isFeaturedLoading} />
        <PopularSection
          kind="tv"
          items={popularSeries}
          loading={isLoading}
          error={error}
        />
        <PopularSection
          kind="movie"
          items={popularMovies}
          loading={isLoading}
          error={error}
        />
        <SocialProof />
        <FinalCta />
      </main>
      <SiteFooter variant="public" />
    </div>
  );
}
