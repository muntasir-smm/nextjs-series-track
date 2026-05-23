// app/ui/tvSeries/series-controls.tsx

"use client";

import React from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

// ===============================
// Types
// ===============================

export type SortOption =
  | "recent"
  | "old"
  | "az"
  | "za"
  | "seasons"
  | "LowSeasons";

export type FilterOption = "all" | "watching" | "completed" | "upcoming";

export type PageSizeOption = 10 | 20 | 50 | 100;

// ===============================
// Default Options
// ===============================

const DEFAULT_FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All Series" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];

const DEFAULT_SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Recently Added" },
  { value: "old", label: "Oldest First" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "seasons", label: "Most Seasons" },
  { value: "LowSeasons", label: "Fewest Seasons" },
];

const DEFAULT_PAGE_SIZE_OPTIONS: PageSizeOption[] = [10, 20, 50, 100];

// ===============================
// Individual Components (can be used separately)
// ===============================

// 1. SEARCH INPUT COMPONENT
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search your series...",
  className = "",
}) => (
  <div className={`relative w-full lg:max-w-md ${className}`}>
    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    )}
  </div>
);

// 2. FILTER DROPDOWN COMPONENT
interface FilterDropdownProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  options?: { value: FilterOption; label: string }[];
  label?: string;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  onChange,
  options = DEFAULT_FILTER_OPTIONS,
  label,
  className = "",
}) => (
  <div className={`relative w-full sm:w-auto ${className}`}>
    {label && (
      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
    )}
    <div className="relative">
      <FunnelIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FilterOption)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-auto"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

// 3. SORT DROPDOWN COMPONENT
interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options?: { value: SortOption; label: string }[];
  label?: string;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  label,
  className = "",
}) => (
  <div className={`relative w-full sm:w-auto ${className}`}>
    {label && (
      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
    )}
    <div className="relative">
      <ChevronUpDownIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-auto"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

// 4. PAGE SIZE DROPDOWN COMPONENT
interface PageSizeDropdownProps {
  value: PageSizeOption;
  onChange: (value: PageSizeOption) => void;
  options?: PageSizeOption[];
  label?: string;
  className?: string;
}

export const PageSizeDropdown: React.FC<PageSizeDropdownProps> = ({
  value,
  onChange,
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  label,
  className = "",
}) => (
  <div className={`relative w-full sm:w-auto ${className}`}>
    {label && (
      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
    )}
    <div className="relative">
      <AdjustmentsHorizontalIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) as PageSizeOption)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-auto"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size} per page
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

// 5. CLEAR FILTERS BUTTON
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
      onClick={onClick}
      className={`rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40 ${className}`}
    >
      Clear Filters
    </button>
  );
};

// ===============================
// Combined Component (for backward compatibility)
// ===============================

interface SeriesControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  filterOptions?: { value: FilterOption; label: string }[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  sortOptions?: { value: SortOption; label: string }[];
  itemsPerPage: PageSizeOption;
  onItemsPerPageChange: (size: PageSizeOption) => void;
  pageSizeOptions?: PageSizeOption[];
  totalItems?: number;
  filteredCount?: number;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export const SeriesControls: React.FC<SeriesControlsProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filterBy,
  onFilterChange,
  filterOptions,
  sortBy,
  onSortChange,
  sortOptions,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions,
  onClearFilters,
  hasActiveFilters,
  className = "",
}) => {
  const isFilterActive =
    hasActiveFilters ??
    (filterBy !== "all" || sortBy !== "recent" || searchQuery !== "");

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFilterChange("all");
      onSortChange("recent");
      onSearchChange("");
    }
  };

  return (
    <div className={className}>
      <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />

          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <FilterDropdown
              value={filterBy}
              onChange={onFilterChange}
              options={filterOptions}
            />
            <SortDropdown
              value={sortBy}
              onChange={onSortChange}
              options={sortOptions}
            />
            <PageSizeDropdown
              value={itemsPerPage}
              onChange={onItemsPerPageChange}
              options={pageSizeOptions}
            />
            <ClearFiltersButton
              onClick={handleClearFilters}
              isActive={isFilterActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesControls;
