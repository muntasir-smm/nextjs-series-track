// app/signup/page.tsx

import SignupForm from "@/app/ui/signup-form";
import PageTransition from "@/app/ui/page-transition";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Join Series Tracker - Create Your Account",
};

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 dark:bg-slate-950 md:py-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[5%] -top-[10%] h-[50vh] w-[50vw] rounded-full bg-brand-400/10 blur-[120px] dark:bg-brand-900/20" />
        <div className="absolute -bottom-[15%] -right-[10%] h-[45vh] w-[45vw] rounded-full bg-violet-400/10 blur-[120px] dark:bg-violet-900/20" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <PageTransition direction="left">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Form side */}
            <div className="order-2 mx-auto w-full max-w-[420px] md:order-1">
              <SignupForm />
            </div>

            {/* Brand side */}
            <div className="order-1 flex flex-col items-center space-y-5 text-center md:order-2 md:items-start md:text-left">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Series
                  <span className="text-brand-600">Tracker</span>
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Your next favorite
                <br />
                <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-pink-500 bg-clip-text text-transparent dark:from-brand-400 dark:via-violet-400 dark:to-pink-400">
                  series awaits.
                </span>
              </h1>

              <p className="max-w-md text-base text-slate-600 dark:text-slate-400">
                Never miss an episode. Keep track of what you&apos;ve watched
                and discover new shows recommended just for you.
              </p>

              <div className="hidden flex-wrap gap-2 pt-1 md:flex">
                {[
                  "Track Shows",
                  "Set Reminders",
                  "Rate Episodes",
                  "Sync Watchlist",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </PageTransition>
      </div>

      <footer className="absolute bottom-5 left-0 w-full px-4 text-center md:hidden">
        <p className="text-[11px] text-slate-500 dark:text-slate-600">
          By joining, you agree to Series Tracker&apos;s{" "}
          <Link
            href="/terms"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
