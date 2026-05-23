// app/dashboard/(overview)/components/recently-added-section.tsx

"use client";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
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
  <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
    <div className="border-b border-gray-200 p-5 dark:border-gray-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recently Added
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your latest additions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle value={viewMode} onChange={onViewModeChange} />
          <Link
            href="/dashboard/tvSeries"
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50 dark:text-blue-400"
          >
            View All <PlusIcon className="h-4 w-4" />
          </Link>
        </div>
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
