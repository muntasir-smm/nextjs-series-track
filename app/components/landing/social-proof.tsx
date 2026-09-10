// app/components/landing/social-proof.tsx

import { CheckCircleIcon } from "@heroicons/react/24/outline";

const POINTS = [
  {
    title: "Episode-level for TV",
    desc: "Not just seasons — every episode",
  },
  {
    title: "Movies included",
    desc: "Watched status in the same library",
  },
  {
    title: "Free to start",
    desc: "Browse now, track after signup",
  },
];

export function SocialProof() {
  return (
    <div className="border-y border-slate-100 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        {POINTS.map((p) => (
          <div key={p.title} className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {p.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
