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
    <main className="relative flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0e17] px-4 py-12 md:py-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[60vw] h-[60vh] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-[140px] opacity-70" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[50vw] h-[50vh] bg-purple-400/10 dark:bg-purple-900/10 rounded-full blur-[140px] opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-[1100px]">
        <PageTransition direction="left">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left Side: Form */}
            <div className="w-full max-w-[450px] mx-auto md:mr-0 lg:max-w-none lg:w-[450px] order-2 md:order-1">
              <SignupForm />
            </div>

            {/* Right Side: Brand - Left Aligned */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 order-1 md:order-2">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex-shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
                  Series
                  <span className="text-blue-600 dark:text-blue-500">
                    Tracker
                  </span>
                </span>
              </div>

              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tighter">
                Your next favorite
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  series awaits.
                </span>
              </div>

              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md">
                Never miss an episode. Keep track of what you&apos;ve watched
                and discover new shows recommended just for you. Join the
                community.
              </p>

              <div className="hidden md:flex flex-wrap gap-2 pt-2">
                {[
                  "Track Shows",
                  "Set Reminders",
                  "Rate Episodes",
                  "Sync Watchlist",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/50 text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </PageTransition>
      </div>

      {/* Mobile Footer */}
      <footer className="absolute bottom-5 left-0 w-full text-center md:hidden px-4">
        <p className="text-[11px] text-gray-500 dark:text-gray-600">
          By joining, you agree to Series Tracker&apos;s{" "}
          <Link
            href="/terms"
            className="text-blue-600 dark:text-blue-500 hover:underline font-medium"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-blue-600 dark:text-blue-500 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
