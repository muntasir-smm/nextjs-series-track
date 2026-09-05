// app/ui/signup-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AtSymbolIcon,
  KeyIcon,
  UserIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500";

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch("/api/auth/csrf-token");
        const data = await response.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error("Error fetching CSRF token:", err);
      }
    };
    fetchCSRFToken();
  }, []);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("one number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push("one special character");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Valid email required");
      return;
    }
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(`Password needs: ${passwordErrors.join(", ")}`);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          _csrf: csrfToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.requiresApproval) {
        setSuccessMessage(
          data.message || "Account created! Awaiting admin approval.",
        );
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        router.push("/login?message=Account created! Please sign in.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => router.push("/login"), 480);
  };

  const passwordRequirements: PasswordRequirement[] = [
    { label: "8+ characters", test: (p) => p.length >= 8 },
    { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "At least one number", test: (p) => /[0-9]/.test(p) },
    {
      label: "Special character",
      test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft-lg transition-all duration-500 dark:border-slate-800 dark:bg-slate-900 md:p-7 ${
          isTransitioning
            ? "scale-95 -translate-x-8 opacity-0"
            : "scale-100 translate-x-0 opacity-100"
        }`}
      >
        <input type="hidden" name="_csrf" value={csrfToken} />

        {/* Header */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Series Tracker Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete the form to start tracking
            </p>
          </div>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                You&apos;re almost in!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
              >
                Continue to Login →
              </button>
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Jane Smith"
                required
                disabled={!!successMessage}
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Email Address
            </label>
            <div className="relative">
              <AtSymbolIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@email.com"
                required
                disabled={!!successMessage}
                className={inputClass}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <div className="relative">
              <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Choose a strong password"
                required
                disabled={!!successMessage}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={!!successMessage}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-60 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>

            {(passwordFocused || formData.password) && (
              <div className="mt-2 space-y-1 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/40">
                {passwordRequirements.map((req) => {
                  const isValid = req.test(formData.password);
                  const StatusIcon = isValid ? CheckCircleIcon : XCircleIcon;
                  return (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        isValid
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-500"
                      }`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Confirm Password
            </label>
            <div className="relative">
              <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Confirm your password"
                required
                disabled={!!successMessage}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                disabled={!!successMessage}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-60 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !!successMessage}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
}
