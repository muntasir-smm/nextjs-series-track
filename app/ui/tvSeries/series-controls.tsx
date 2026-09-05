// app/ui/tvSeries/series-controls.tsx

"use client";

import React from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

export type SortOption =
  "recent" | "old" | "az" | "za" | "largest" | "smallest";

export type FilterOption = "all" | "watching" | "completed" | "upcoming";
export type PageSizeOption = 10 | 20 | 50 | 100;
export type ViewMode = "grid" | "list";

const DEFAULT_FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All Series" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];

const DEFAULT_SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Newest" },
  { value: "old", label: "Oldest" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "largest", label: "Largest" },
  { value: "smallest", label: "Smallest" },
];

const DEFAULT_PAGE_SIZE_OPTIONS: PageSizeOption[] = [10, 20, 50, 100];

const selectClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto";

export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({
  value,
  onChange,
  placeholder = "Search series...",
  className = "",
}) => (
  <div className={clsx("relative w-full lg:max-w-md", className)}>
    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search series"
      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    )}
  </div>
);

export const FilterDropdown: React.FC<{
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  className?: string;
}> = ({ value, onChange, className = "" }) => (
  <div className={clsx("relative w-full sm:w-auto", className)}>
    <FunnelIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FilterOption)}
      aria-label="Filter series"
      className={selectClass}
    >
      {DEFAULT_FILTER_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const SortDropdown: React.FC<{
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}> = ({ value, onChange, className = "" }) => (
  <div className={clsx("relative w-full sm:w-auto", className)}>
    <ChevronUpDownIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      aria-label="Sort series"
      className={selectClass}
    >
      {DEFAULT_SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const PageSizeDropdown: React.FC<{
  value: PageSizeOption;
  onChange: (value: PageSizeOption) => void;
  className?: string;
}> = ({ value, onChange, className = "" }) => (
  <div className={clsx("relative w-full sm:w-auto", className)}>
    <AdjustmentsHorizontalIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as PageSizeOption)}
      aria-label="Items per page"
      className={selectClass}
    >
      {DEFAULT_PAGE_SIZE_OPTIONS.map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  </div>
);

export const ViewToggle: React.FC<{
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}> = ({ value, onChange, className = "" }) => (
  <div
    className={clsx(
      "flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800",
      className,
    )}
  >
    <button
      type="button"
      onClick={() => onChange("grid")}
      aria-label="Grid view"
      aria-pressed={value === "grid"}
      className={clsx(
        "rounded-lg px-3 py-1.5 transition",
        value === "grid"
          ? "bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-400"
          : "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700",
      )}
    >
      <Squares2X2Icon className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={() => onChange("list")}
      aria-label="List view"
      aria-pressed={value === "list"}
      className={clsx(
        "rounded-lg px-3 py-1.5 transition",
        value === "list"
          ? "bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-400"
          : "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700",
      )}
    >
      <ListBulletIcon className="h-4 w-4" />
    </button>
  </div>
);

export const ClearFiltersButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}> = ({ onClick, isActive = true, className = "" }) => {
  if (!isActive) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50",
        className,
      )}
    >
      Clear
    </button>
  );
};

interface SeriesControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  itemsPerPage: PageSizeOption;
  onItemsPerPageChange: (size: PageSizeOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  showViewToggle?: boolean;
  className?: string;
}

export const SeriesControls: React.FC<SeriesControlsProps> = ({
  searchQuery,
  onSearchChange,
  filterBy,
  onFilterChange,
  sortBy,
  onSortChange,
  itemsPerPage,
  onItemsPerPageChange,
  viewMode,
  onViewModeChange,
  onClearFilters,
  hasActiveFilters,
  showViewToggle = true,
  className = "",
}) => {
  const isActive =
    hasActiveFilters ??
    (filterBy !== "all" || sortBy !== "recent" || searchQuery.trim() !== "");

  const handleClear = () => {
    if (onClearFilters) return onClearFilters();
    onFilterChange("all");
    onSortChange("recent");
    onSearchChange("");
  };

  return (
    <div className={className}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={searchQuery} onChange={onSearchChange} />
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown value={filterBy} onChange={onFilterChange} />
            <SortDropdown value={sortBy} onChange={onSortChange} />
            <PageSizeDropdown
              value={itemsPerPage}
              onChange={onItemsPerPageChange}
            />
            {showViewToggle && (
              <ViewToggle value={viewMode} onChange={onViewModeChange} />
            )}
            <ClearFiltersButton onClick={handleClear} isActive={isActive} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesControls;
