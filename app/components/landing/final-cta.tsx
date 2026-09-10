// app/components/landing/final-cta.tsx

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export function FinalCta() {
  return (
    <div className="bg-gradient-to-r from-brand-600 to-violet-600 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to track smarter?
        </h2>
        <p className="mt-3 text-lg text-brand-100">
          Create your free account and build a library you&apos;ll actually
          finish.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
        >
          Create free account
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
