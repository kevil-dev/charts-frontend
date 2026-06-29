"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Tiny client island for the desktop auth buttons.
 * Keeps LeftLinks as a server component.
 */
export default function AuthButtons() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/charts/apple/us/top");
  }

  if (isLoading) {
    return <div className="w-36" />;
  }

  if (user) {
    const initial = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();
    return (
      <>
        <Link
          href="/lists"
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          My Lists
        </Link>
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold select-none"
            aria-hidden="true"
          >
            {initial}
          </div>
          <span className="max-w-[120px] truncate text-sm text-muted-foreground">
            {user.name ?? user.email}
          </span>
        </div>
        <Button variant="secondary" size="lg" onClick={handleLogout}>
          Logout
        </Button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className={buttonVariants({ variant: "secondary", size: "lg" })}
      >
        Login
      </Link>
      <Link href="/register" className={buttonVariants({ size: "lg" })}>
        Free Trial
      </Link>
    </>
  );
}
