"use client";

import { useEffect } from "react";
import Image from "next/image";
import { XIcon, LockIcon, ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RankMoveBadge } from "./ChartRow";

export default function PodcastDrawer({ podcast, onClose }) {
  const { user } = useAuth();
  const isGuest = !user;
  const isOpen = !!podcast;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const signInUrl = typeof window !== "undefined"
    ? `/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`
    : "/login";

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={podcast?.name ?? "Podcast detail"}
        className={[
          "fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          {/* Back button — mobile only */}
          <button
            onClick={onClose}
            aria-label="Back to list"
            className="flex md:hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </button>
          {/* Name — desktop only */}
          <p className="hidden md:block text-sm font-semibold text-foreground truncate pr-4">
            {podcast?.name ?? ""}
          </p>
          {/* X button — desktop only */}
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="hidden md:flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {podcast && (
            <>
              {/* Artwork + rank hero */}
              <div className="flex items-start gap-4 px-5 pt-5 pb-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                  {podcast.artwork ? (
                    <Image
                      src={podcast.artwork}
                      alt={podcast.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-xl bg-muted text-xl font-bold text-muted-foreground">
                      {(podcast.name?.[0] ?? "?").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{podcast.chart_rank}
                    </span>
                    <RankMoveBadge rankMove={podcast.rank_move} />
                  </div>
                  <p className="text-base font-semibold leading-snug tracking-tight">
                    {podcast.name}
                  </p>
                  {podcast.artist_or_publisher && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {podcast.artist_or_publisher}
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px bg-border mx-5" />

              {/* Guest-gated content */}
              {isGuest ? (
                <div className="relative px-5 pt-5">
                  {/* Blurred placeholder rows */}
                  <div className="select-none pointer-events-none" aria-hidden="true">
                    {[120, 80, 100, 60, 90].map((w, i) => (
                      <div key={i} className="mb-4">
                        <div className={`h-3 ${w === 120 ? "w-full" : w === 80 ? "w-4/5" : w === 100 ? "w-full" : w === 60 ? "w-3/5" : "w-9/10"} rounded bg-muted mb-1.5 blur-[3px]`} />
                        <div className="h-3 w-3/5 rounded bg-muted blur-[3px]" />
                      </div>
                    ))}
                  </div>

                  {/* Overlay CTA */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted mb-3">
                      <LockIcon className="size-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Sign in to view podcast details
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Create a free account to unlock the full chart data.
                    </p>
                    <a
                      href={signInUrl}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      Sign in to continue
                    </a>
                  </div>
                </div>
              ) : (
                /* Logged-in: show available data from the row */
                <div className="px-5 pt-5 flex flex-col gap-4">
                  {podcast.genre_label && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Category</p>
                      <p className="text-sm text-foreground">{podcast.genre_label}</p>
                    </div>
                  )}
                  {podcast.country_name && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Country</p>
                      <p className="text-sm text-foreground">{podcast.flag} {podcast.country_name}</p>
                    </div>
                  )}
                  {podcast.run_date && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Last updated</p>
                      <p className="text-sm text-foreground">{podcast.run_date}</p>
                    </div>
                  )}
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      More podcast analytics coming soon.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
