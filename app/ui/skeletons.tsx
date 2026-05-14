// app/ui/skeletons.tsx (convert to .tsx for TypeScript)

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm dark:bg-gray-800`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200 dark:bg-gray-700" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium dark:bg-gray-700" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8 dark:bg-gray-900">
        <div className="h-7 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function SeriesListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <div className="relative">
        <div className="h-12 w-full rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>

      {/* Series grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`${shimmer} relative overflow-hidden rounded-lg bg-white p-4 shadow dark:bg-gray-800`}
          >
            <div className="relative mb-3 h-48 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 last-of-type:border-none dark:border-gray-800">
      <td className="whitespace-nowrap px-4 py-3">
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-6 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="ml-auto h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
      </td>
    </tr>
  );
}

export function SeriesTableSkeleton() {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Total Seasons</th>
            <th className="px-4 py-3 text-left">Upcoming</th>
            <th className="px-4 py-3 text-left">Progress</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="text-center">
        <div className="mx-auto h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mx-auto mt-2 h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Series list skeleton */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="p-4">
          <SeriesTableSkeleton />
        </div>
      </div>
    </div>
  );
}

// Loading component for TV Series page
export function TvSeriesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-1 h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 space-y-4">
              <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
        <div className="lg:w-1/3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 h-12 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="p-4">
          <SeriesTableSkeleton />
        </div>
      </div>
    </div>
  );
}
