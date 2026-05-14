// app/dashboard/(overview)/error.tsx

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="mb-4 text-2xl font-bold text-red-600">
        Something went wrong!
      </h2>
      <button
        onClick={reset}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Try again...
      </button>
    </div>
  );
}
