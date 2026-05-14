// app/not-found.tsx

import TopNav from "@/app/ui/dashboard/topnav";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <TopNav />
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-blue-500 dark:text-blue-400">
            404
          </h1>
          <div className="h-1 w-24 bg-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
      </div>
    </main>
  );
}
