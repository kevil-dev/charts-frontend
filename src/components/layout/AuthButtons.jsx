"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Tiny client island for the desktop auth buttons.
 * Keeps LeftLinks as a server component.
 */
export default function AuthButtons() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="w-36" />;
  }

  if (user) {
    return (
      <>
        <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
        <Button variant="secondary" size="lg" onClick={logout}>
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
      <Link href="/start" className={buttonVariants({ size: "lg" })}>
        Free Trial
      </Link>
    </>
  );
}
