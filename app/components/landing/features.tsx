// app/components/landing/features.tsx

import {
  FilmIcon,
  ClockIcon,
  ChartBarIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

const FEATURES = [
  {
    icon: ListBulletIcon,
    color: "bg-brand-500",
    title: "Episode checklist",
    desc: "Mark individual episodes, not only whole seasons",
  },
  {
    icon: FilmIcon,
    color: "bg-violet-500",
    title: "Movies & TV",
    desc: "One personal library for films and series",
  },
  {
    icon: ClockIcon,
    color: "bg-emerald-500",
    title: "Never lose your place",
    desc: "Pick up exactly where you left off",
  },
  {
    icon: ChartBarIcon,
    color: "bg-orange-500",
    title: "Clear progress",
    desc: "See what you’ve finished and what’s next",
  },
];

export function Features() {
  return (
    <div className="border-y border-slate-100 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Built for real watching habits
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
            Not just another list — track progress the way you actually watch
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}
              >
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
