"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CiMenuFries } from "react-icons/ci";
import { XIcon, Bookmark, CreditCard, LogOut } from "lucide-react";
import { navLinks } from "../../../config/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function MobileMenuToggle() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function handleLogout() {
    logout();
    setOpen(false);
    router.push("/charts/apple/us/top");
  }
  const menuRef = useRef(null);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Prevent background scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger / Close button — only visible on mobile */}
      <button
        ref={menuRef}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((prev) => !prev)}
        className="hidden p-1.5 max-md:inline-flex rounded-md hover:bg-muted transition-colors"
      >
        {open ? (
          <XIcon className="h-6 w-6" />
        ) : (
          <CiMenuFries className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile nav panel — slides in from top below the sticky header */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-label="Mobile navigation"
        className={cn(
          "fixed left-0 right-0 top-(--navbar-height) z-50 bg-background border-b shadow-lg md:hidden",
          "transition-all duration-200 ease-in-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Auth actions */}
          <div className="mt-3 flex flex-col gap-2 border-t pt-4">
            {isLoading ? (
              <div className="h-9" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2.5 px-1">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold select-none"
                    aria-hidden="true"
                  >
                    {(user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                  </div>
                  <span className="truncate text-sm text-muted-foreground">
                    {user.name ?? user.email}
                  </span>
                </div>
                <Link
                  href="/lists"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2"
                >
                  <Bookmark className="size-4" /> My Lists
                </Link>
                <Link
                  href="/billing"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2"
                >
                  <CreditCard className="size-4" /> Billing
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm text-[#ee0000] hover:bg-[#fff0f0] text-left flex items-center gap-2 w-full"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants({ size: "lg" })}
                >
                  Free Trial
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}