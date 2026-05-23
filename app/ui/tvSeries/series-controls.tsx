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

// ===============================
// TYPES
// ===============================

export type SortOption =
  | "recent"
  | "old"
  | "az"
  | "za"
  | "largest"
  | "smallest";

export type FilterOption = "all" | "watching" | "completed" | "upcoming";

export type PageSizeOption = 10 | 20 | 50 | 100;

export type ViewMode = "grid" | "list";

// ===============================
// DEFAULT OPTIONS
// ===============================

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

// ===============================
// SEARCH INPUT
// ===============================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search series...",
  className = "",
}) => (
  <div className={`relative w-full lg:max-w-md ${className}`}>
    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search series"
      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
    />

    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    )}
  </div>
);

// ===============================
// FILTER DROPDOWN
// ===============================

interface FilterDropdownProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  options?: { value: FilterOption; label: string }[];
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  onChange,
  options = DEFAULT_FILTER_OPTIONS,
  className = "",
}) => (
  <div className={`relative w-full sm:w-auto ${className}`}>
    <div className="relative">
      <FunnelIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FilterOption)}
        aria-label="Filter series"
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:bg-gray-800 sm:w-auto"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// ===============================
// SORT DROPDOWN
// ===============================

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options?: { value: SortOption; label: string }[];
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  className = "",
}) => (
  <div className={`relative w-full sm:w-auto ${className}`}>
    <div className="relative">
      <ChevronUpDownIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label="Sort series"
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:bg-gray-800 sm:w-auto"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// ===============================
// PAGE SIZE DROPDOWN
// ===============================

interface PageSizeDropdownProps {
  value: PageSizeOption;
  onChange: (value: PageSizeOption) => void;
  className?: string;
}

export const PageSizeDropdown: React.FC<PageSizeDropdownProps> = ({
  value,
  onChange,
  className = "",
}) => (
  <div className={`relative w-full sm:w-auto ${className}`}>
    <div className="relative">
      <AdjustmentsHorizontalIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as PageSizeOption)}
        aria-label="Items per page"
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:bg-gray-800 sm:w-auto"
      >
        {DEFAULT_PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// ===============================
// VIEW TOGGLE
// ===============================

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  value,
  onChange,
  className = "",
}) => (
  <div
    className={`flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 ${className}`}
  >
    <button
      type="button"
      onClick={() => onChange("grid")}
      aria-label="Grid view"
      aria-pressed={value === "grid"}
      className={`rounded-lg px-3 py-1.5 transition-all duration-200 ${
        value === "grid"
          ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
          : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
      }`}
    >
      <Squares2X2Icon className="h-4 w-4" />
    </button>

    <button
      type="button"
      onClick={() => onChange("list")}
      aria-label="List view"
      aria-pressed={value === "list"}
      className={`rounded-lg px-3 py-1.5 transition-all duration-200 ${
        value === "list"
          ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
          : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
      }`}
    >
      <ListBulletIcon className="h-4 w-4" />
    </button>
  </div>
);

// ===============================
// CLEAR FILTERS BUTTON
// ===============================

interface ClearFiltersButtonProps {
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}

export const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({
  onClick,
  isActive = true,
  className = "",
}) => {
  if (!isActive) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 ${className}`}
    >
      Clear Filters
    </button>
  );
};

// ===============================
// MAIN COMPONENT
// ===============================

interface SeriesControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;

  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;

  itemsPerPage: PageSizeOption;
  onItemsPerPageChange: (size: PageSizeOption) => void;

  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  totalItems?: number;
  filteredCount?: number;

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
  totalItems,
  filteredCount,
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
      <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all dark:border-gray-700 dark:bg-gray-900/80">
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
