"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { XIcon, LockIcon, ArrowLeftIcon, Loader2Icon, ExternalLinkIcon } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/authSlice";
import { RankMoveBadge } from "./ChartRow";
import { useGetPodcastMetaQuery } from "@/services/podcastApiSlice";
import { resolveTier } from "@/utils/resolveTier";


// ── single labelled metadata row ──────────────────────────────────────────────
function MetaRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

// ── upgrade gate ──────────────────────────────────────────────────────────────
function UpgradeGate({ message }) {
  return (
    <div className="mx-5 mt-5 rounded-xl border border-border bg-muted/30 px-5 py-6 text-center">
      <div className="flex size-9 items-center justify-center rounded-full bg-muted mx-auto mb-3">
        <LockIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{message}</p>
      <p className="text-xs text-muted-foreground mb-4">
        Unlock full show profiles, episode data, ratings, and rank trends.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-80 transition-opacity"
      >
        View plans
      </Link>
    </div>
  );
}

// ── blurred pro-tier preview for free plan users ───────────────────────────────
const DUMMY_PRO_ROWS = [
  { label: "Full Description", value: "An in-depth weekly exploration of technology, culture, and the forces shaping the modern world through expert interviews and narrative storytelling." },
  { label: "Release Frequency", value: "Weekly" },
  { label: "Avg Episode Length", value: "48 min" },
  { label: "Language", value: "English" },
  { label: "Content Rating", value: "Clean" },
  { label: "First Published", value: "Mar 2017" },
  { label: "Latest Episode", value: "Jun 2025" },
];

function LockedProSection({ podcastId }) {
  return (
    <div className="relative mt-2">
      {/* Blurred dummy content */}
      <div
        className="px-5 flex flex-col gap-5 pb-4 select-none pointer-events-none"
        aria-hidden="true"
        style={{ filter: "blur(5px)", opacity: 0.6 }}
      >
        <div className="h-px bg-border" />
        {DUMMY_PRO_ROWS.slice(0, 3).map((row) => (
          <div key={row.label}>
            <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">
              {row.label}
            </p>
            <p className="text-sm text-foreground">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <div className="rounded-2xl border border-border bg-background/90 backdrop-blur-sm px-6 py-5 shadow-lg flex flex-col items-center">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted mb-3">
            <LockIcon className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            Deep analytics locked
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Upgrade to view rank trends, deep metadata, and ratings.
          </p>
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Upgrade to view
          </Link>
        </div>
      </div>
    </div>
  );
}


export default function PodcastDrawer({ podcast, onClose }) {
  const user = useAppSelector(selectUser);
  const isGuest = !user;
  const isFree = resolveTier(user) === "free";
  const isOpen = !!podcast;
  const [artworkError, setArtworkError] = useState(false);

  const { data: meta, isLoading, error } = useGetPodcastMetaQuery(podcast?.match_key, {
    skip: isGuest || !isOpen || !podcast?.match_key,
  });

  const upgradeError = error?.code === "UPGRADE";
  const notFound = error?.code === "NO_DATA_FOUND";


  useEffect(() => { setArtworkError(false); }, [podcast?.id]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const signInUrl =
    typeof window !== "undefined"
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

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={podcast?.name ?? "Podcast detail"}
        className={[
          "fixed right-0 top-(--navbar-height) z-50 h-[calc(100%-var(--navbar-height))] w-full max-w-md bg-background shadow-2xl md:top-0 md:h-full",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <button
            onClick={onClose}
            aria-label="Back"
            className="flex md:hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </button>
          <p className="hidden md:block text-sm font-semibold text-foreground truncate pr-4">
            {podcast?.name ?? ""}
          </p>
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
                  {podcast.artwork && !artworkError ? (
                    <Image
                      src={podcast.artwork}
                      alt={podcast.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      loading="eager"
                      onError={() => setArtworkError(true)}
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

              {/* ── Guest gate ── */}
              {isGuest ? (
                <div className="relative px-5 pt-5">
                  <div className="select-none pointer-events-none" aria-hidden="true">
                    {[100, 80, 100, 60, 90].map((w, i) => (
                      <div key={i} className="mb-4">
                        <div className={`h-3 w-${w === 100 ? "full" : w === 80 ? "4/5" : w === 60 ? "3/5" : "9/10"} rounded bg-muted mb-1.5 blur-[3px]`} />
                        <div className="h-3 w-3/5 rounded bg-muted blur-[3px]" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted mb-3">
                      <LockIcon className="size-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Sign in to view podcast details
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Create a free account to unlock chart data.
                    </p>
                    <Link
                      href={signInUrl}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      Sign in to continue
                    </Link>
                  </div>
                </div>
              ) : upgradeError ? (
                <UpgradeGate message="Upgrade to Pro to unlock podcast details" />
              ) : (
                <div className="px-5 pt-5 flex flex-col gap-5 pb-8">

                  {/* ── Loading skeleton ── */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground py-4">
                      <Loader2Icon className="size-4 animate-spin" />
                      <span className="text-sm">Loading details…</span>
                    </div>
                  )}

                  {/* ── Chart row data (always available) ── */}
                  {podcast.genre_label && (
                    <MetaRow label="Category" value={podcast.genre_label} />
                  )}
                  {podcast.country_name && (
                    <MetaRow
                      label="Country"
                      value={`${podcast.flag ?? ""} ${podcast.country_name}`.trim()}
                    />
                  )}

                  {/* ── Free tier fields ── */}
                  {meta?.description && (
                    <>
                      <div className="h-px bg-border" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">
                          About
                        </p>
                        <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                          {meta.description}
                        </p>
                      </div>
                    </>
                  )}
                  {meta?.author && <MetaRow label="Author" value={meta.author} />}
                  {meta?.episode_count != null && (
                    <MetaRow label="Episodes" value={meta.episode_count.toLocaleString("en-IN")} />
                  )}

                  {/* ── Locked pro preview for free users ── */}
                  {isFree && !isLoading && meta && <LockedProSection podcastId={podcast.match_key} />}

                  {/* ── Pro/Elite Navigation Button ── */}
                  {!isFree && !isLoading && meta && (
                    <>
                      <div className="h-px bg-border" />
                      <Link
                        href={`/podcasts/${encodeURIComponent(podcast.match_key)}?name=${encodeURIComponent(podcast.name)}&artwork=${encodeURIComponent(podcast.artwork || podcast.artwork_url_600 || "")}`}
                        className="group inline-flex w-full items-center justify-between rounded-xl bg-muted/50 border border-border/50 px-5 py-4 hover:bg-muted transition-colors"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-foreground">View Full Analytics</span>
                          <span className="text-xs text-muted-foreground mt-0.5">Rank trends, metadata, and ratings</span>
                        </div>
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background border border-border/50 shadow-sm group-hover:scale-110 transition-transform">
                          <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
                        </div>
                      </Link>
                    </>
                  )}



                  {/* ── Not found / empty state ── */}
                  {!isLoading && notFound && (
                    <p className="text-sm text-muted-foreground">
                      No additional data available for this podcast yet.
                    </p>
                  )}

                  {/* ── No meta loaded yet and no error = table empty ── */}
                  {!isLoading && !meta && !error && (
                    <p className="text-sm text-muted-foreground">
                      No additional data available for this podcast yet.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
