"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser, selectAuthLoading, register, loginWithGoogle } from "@/store/authSlice";
import { resetAllApiCaches } from "@/store/resetApiCaches";
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

function RegisterPageContent() {
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(from && from.startsWith("/") ? from : "/pricing");
    }
  }, [isLoading, user, router, from]);

  const googleBtnRef = useRef(null);

  useEffect(() => {
    const tryRender = () => {
      if (!window.google || !googleBtnRef.current) return false;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await dispatch(loginWithGoogle(response.credential)).unwrap();
            // Defense-in-depth: flush any residual cache from a previous session.
            resetAllApiCaches(dispatch);
            router.push(
              from && from.startsWith("/") ? from : "/charts/apple/us/top",
            );
          } catch (err) {
            setError(err.message);
          }
        },
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "signup_with",
      });
      return true;
    };

    if (tryRender()) return;

    const interval = setInterval(() => {
      if (tryRender()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || user) return null;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(register({ name, email, password })).unwrap();
      router.push(from && from.startsWith("/") ? from : "/pricing");
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
    <div className="flex flex-col gap-6 bg-white p-8 sm:p-10 rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-[0_2px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Get started
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Create your account.
        </h1>
        <p className="text-sm text-muted-foreground">
          Start tracking the charts in seconds.
        </p>
      </div>

      {/* Google button (disabled placeholder) */}
      {/* <Button
        variant="outline"
        className="h-11 w-full gap-2 cursor-not-allowed opacity-60"
        disabled
      >
        <GoogleIcon />
        Sign up with Google
      </Button> */}
      {/* Google button (GIS-rendered) */}
      <div ref={googleBtnRef} className="flex justify-center" />

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
        {/* Full name */}
        <div>
          <label
            htmlFor="register-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="register-email"
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
            htmlFor="register-password"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
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
        {submitting ? "Creating account…" : "Create account"}
      </Button>

      {/* Link to login */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}
