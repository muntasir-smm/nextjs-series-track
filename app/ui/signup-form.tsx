// app/ui/signup-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { useExitTransition } from "@/app/ui/login-form";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

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
  const { isExiting, navigateTo } = useExitTransition();

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
        // Use exit transition before navigating to login
        navigateTo("/login?message=Account created! Please sign in.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo("/login");
  };

  const passwordRequirements: PasswordRequirement[] = [
    { label: "8+ characters", test: (p: string) => p.length >= 8 },
    { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
    {
      label: "Special character",
      test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/*
        Exit transition: slide right + fade out when navigating back to login.
        The parent PageTransition handles the enter animation for this page.
      */}
      <div
        style={{
          opacity: isExiting ? 0 : 1,
          transform: isExiting
            ? "translateX(40px) scale(0.97)"
            : "translateX(0) scale(1)",
          transition:
            "opacity 0.4s cubic-bezier(0.4, 0, 1, 1), transform 0.4s cubic-bezier(0.4, 0, 1, 1)",
          willChange: "opacity, transform",
        }}
        className="bg-white dark:bg-gray-950 p-5 md:p-7 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border-t-2 border-l-2 border-gradient-from-blue-500-to-purple-600 dark:border-gray-800 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Complete the form to start tracking.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3.5 flex gap-2.5 animate-in slide-in-from-top duration-300">
            <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                You&apos;re almost in!
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => navigateTo("/login")}
                className="mt-0.5 text-xs font-semibold text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-colors"
              >
                Continue to Login →
              </button>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-3.5">
          {/* Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-gray-800 dark:text-gray-300"
            >
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500">
                <UserIcon className="h-4 w-4" />
              </div>
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
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-200 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-800 dark:text-gray-300"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500">
                <AtSymbolIcon className="h-4 w-4" />
              </div>
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
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-200 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-800 dark:text-gray-300"
            >
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500">
                <KeyIcon className="h-4 w-4" />
              </div>
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
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-200 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={!!successMessage}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-60 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {(passwordFocused || formData.password) && (
              <div className="mt-2 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/30 space-y-1">
                {passwordRequirements.map((req) => {
                  const isValid = req.test(formData.password);
                  const StatusIcon = isValid ? CheckCircleIcon : XCircleIcon;
                  return (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1.5 text-xs ${isValid ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-600"}`}
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
          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-gray-800 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500">
                <KeyIcon className="h-4 w-4" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Re-enter your password"
                required
                disabled={!!successMessage}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-200 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                disabled={!!successMessage}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-60 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {formData.confirmPassword && (
              <div
                className={`mt-1.5 flex items-center gap-1.5 text-xs ${formData.password === formData.confirmPassword ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {formData.password === formData.confirmPassword ? (
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                ) : (
                  <XCircleIcon className="h-3.5 w-3.5" />
                )}
                <span>
                  {formData.password === formData.confirmPassword
                    ? "Passwords match"
                    : "Passwords must match"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/80 p-2.5 flex items-center gap-2 text-red-700 dark:text-red-400">
            <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        {!successMessage && (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 disabled:opacity-70 flex items-center justify-center gap-2.5 text-sm shadow-md shadow-blue-500/20 dark:shadow-blue-500/10 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white/70"
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
              "Complete Sign Up"
            )}
          </button>
        )}

        {/* Footer */}
        <div className="text-center pt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="text-blue-600 dark:text-blue-500 font-semibold hover:underline transition-colors"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </form>
  );
}
