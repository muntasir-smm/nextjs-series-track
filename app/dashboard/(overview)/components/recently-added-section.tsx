// app/dashboard/(overview)/components/recently-added-section.tsx

"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ViewToggle } from "@/app/ui/tvSeries/series-controls";
import SeriesList from "@/app/ui/tvSeries/series-list";
import type { ViewMode } from "@/app/ui/tvSeries/series-controls";
import type { Series } from "@/app/lib/series";

interface RecentlyAddedSectionProps {
  series: Series[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onUpdateSeries: (updatedSeries: Series[]) => void;
  onDeleteSeries: (id: string) => void;
  onEditSeries: (series: Series) => void;
}

export const RecentlyAddedSection: React.FC<RecentlyAddedSectionProps> = ({
  series,
  viewMode,
  onViewModeChange,
  onUpdateSeries,
  onDeleteSeries,
  onEditSeries,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Recently Added
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your latest additions
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ViewToggle value={viewMode} onChange={onViewModeChange} />
        <Link
          href="/dashboard/tvSeries"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
        >
          View all
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>

    <div className="p-5">
      <SeriesList
        series={series}
        updateSeries={onUpdateSeries}
        deleteSeries={onDeleteSeries}
        onEditSeries={onEditSeries}
        viewMode={viewMode}
      />
    </div>
  </div>
);
