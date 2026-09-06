// app/dashboard/tvSeries/[id]/components/series-sidebar.tsx

"use client";

import type { Series } from "@/app/lib/series";

function formatDate(dateString?: string | null) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function SeriesSidebar({ series }: { series: Series }) {
  const watchedCount = (series.watchedSeasons || []).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {(series.originalLanguage || series.originalName) && (
        <Card title="Original info" accent="from-indigo-500 to-violet-500">
          {series.originalName && series.originalName !== series.name && (
            <Row label="Original name" value={series.originalName} />
          )}
          {series.originalLanguage && (
            <Row
              label="Language"
              value={series.originalLanguage.toUpperCase()}
            />
          )}
        </Card>
      )}

      {(series.firstAirDate || series.lastAirDate) && (
        <Card title="Release info" accent="from-orange-500 to-red-500">
          {series.firstAirDate && (
            <Row label="First air" value={formatDate(series.firstAirDate)!} />
          )}
          {series.lastAirDate && (
            <Row label="Last air" value={formatDate(series.lastAirDate)!} />
          )}
        </Card>
      )}

      {series.networks && series.networks.length > 0 && (
        <Card title="Networks" accent="from-cyan-500 to-brand-500">
          <div className="flex flex-wrap gap-2">
            {series.networks.map((n) => (
              <span
                key={n}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {n}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card title="Quick stats" accent="from-pink-500 to-rose-500">
        <Row label="Completion" value={`${series.watchProgress}%`} />
        <Row label="Seasons" value={`${watchedCount}/${series.totalSeasons}`} />
        {series.popularity != null && series.popularity > 0 && (
          <Row
            label="Popularity"
            value={String(Math.round(series.popularity))}
          />
        )}
        {series.voteCount != null && series.voteCount > 0 && (
          <Row label="Votes" value={series.voteCount.toLocaleString()} />
        )}
      </Card>
    </div>
  );
}

function Card({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <div className={`h-6 w-1 rounded-full bg-gradient-to-b ${accent}`} />
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}
