"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginPageContent() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/charts/apple/us/top");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) return null;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.push(from && from.startsWith("/") ? from : "/charts/apple/us/top");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !submitting) handleSubmit();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Welcome back
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Sign in to Million.
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to access your charts.
        </p>
      </div>

      {/* Google button (disabled placeholder) */}
      <Button
        variant="outline"
        className="h-11 w-full gap-2 cursor-not-allowed opacity-60"
        disabled
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      {/* OR divider */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="mx-4 text-xs uppercase tracking-widest text-muted-foreground">
          OR
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Submit */}
      <Button
        className="h-11 w-full"
        disabled={submitting}
        onClick={handleSubmit}
      >
        {submitting ? "Signing in…" : "Sign in"}
      </Button>

      {/* Link to register */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-foreground underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
