"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  AlertCircleIcon,
  RefreshCwIcon,
  InboxIcon,
  BookmarkPlusIcon,
} from "lucide-react";
import ChartRow, {
  PlatformIcon,
  RankMoveBadge,
  ChartRowCard,
} from "./ChartRow";
import { useAuth } from "@/features/auth/context/AuthContext";

function PodiumSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-background p-5.5 flex flex-col">
      <div className="flex items-start gap-4.5">
        <div className="size-14 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-8 rounded bg-muted" />
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-px my-5 bg-muted" />
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <div className="size-4 rounded bg-muted" />
          <div className="size-4 rounded bg-muted" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="w-10 pl-4 pr-2 py-3">
        <div className="size-4 rounded bg-muted" />
      </td>
      <td className="w-10 pr-3 py-3">
        <div className="h-4 w-6 rounded bg-muted ml-auto" />
      </td>
      <td className="py-3 pr-4">
        <div className="size-10 rounded-lg bg-muted" />
      </td>
      <td className="py-3 pr-6 min-w-0">
        <div className="h-4 w-48 rounded bg-muted mb-1.5" />
        <div className="h-3 w-32 rounded bg-muted" />
      </td>
      <td className="py-3 pr-6">
        <div className="size-4 rounded bg-muted" />
      </td>
      <td className="py-3 pr-4">
        <div className="h-6 w-16 rounded bg-muted ml-auto" />
      </td>
    </tr>
  );
}

function PodiumCard({
  row,
  isFirst,
  isSelected,
  onToggle,
  onAddToList,
  onRowClick,
}) {
  const [artworkError, setArtworkError] = useState(false);
  const isDark = isFirst;

  return (
    <div
      onClick={() => onRowClick?.(row)}
      className={[
        "rounded-xl p-[22px] flex flex-col relative cursor-pointer",
        isDark
          ? "bg-[#171717] text-white border border-[#2a2a2e]"
          : "bg-white border border-border text-foreground",
      ].join(" ")}
    >
      {/* Checkbox — top-right absolute */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(row.id);
          }}
          aria-label={
            isSelected ? `Deselect ${row.name}` : `Select ${row.name}`
          }
          className={[
            "flex size-7 items-center justify-center rounded-lg border transition-colors",
            isSelected
              ? isDark
                ? "bg-white border-white"
                : "bg-[#171717] border-[#171717]"
              : isDark
                ? "border-white/30 bg-white/5"
                : "border-[#d4d4d4] bg-white",
          ].join(" ")}
        >
          {isSelected && (
            <svg
              viewBox="0 0 12 12"
              className="size-3"
              fill="none"
              stroke={isDark ? "#171717" : "white"}
              strokeWidth="2.5"
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>
      </div>

      {/* Grows to fill available height — pins divider+footer to bottom */}
      <div className="flex-1">
        {/* Top section: artwork + info */}
        <div className="flex items-start gap-4.5">
          {/* Artwork */}
          {row.artwork && !artworkError ? (
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full">
              <Image
                src={row.artwork}
                alt={row.name}
                fill
                sizes="56px"
                className="object-cover"
                onError={() => setArtworkError(true)}
              />
            </div>
          ) : (
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
              style={
                isDark
                  ? { background: "linear-gradient(140deg,#3a3a40,#232327)" }
                  : { background: "#ededed" }
              }
            >
              <span className={isDark ? "text-[#e5e5e5]" : "text-[#171717]"}>
                {(row.name?.[0] ?? "?").toUpperCase()}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0 pr-10">
            <p className="font-mono text-[13px] font-medium tracking-[0.02em] text-[#a1a1a1]">
              #{row.chart_rank}
              {isFirst && <span className="text-[#ededed]"> · Leading</span>}
            </p>
            <p
              className={`font-semibold text-[21px] tracking-[-0.03em] leading-[1.15] mt-1.25 ${isDark ? "text-white" : "text-foreground"}`}
            >
              {row.name}
            </p>
            {row.artist_or_publisher && (
              <p
                className={`mt-1.75 text-sm tracking-[-0.01em] leading-[1.4] ${isDark ? "text-[#a1a1a1]" : "text-muted-foreground"}`}
              >
                {row.artist_or_publisher}
              </p>
            )}
          </div>
        </div>

        {/* Rank movement badge — uses shared component so NEW/UNCHANGED are handled */}
        <div className="mt-4 self-start">
          <RankMoveBadge rankMove={row.rank_move} />
        </div>
      </div>

      {/* Divider */}
      <div
        className={`h-px my-5 ${isDark ? "bg-white/[12%]" : "bg-[#ebebeb]"}`}
      />

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <PlatformIcon row={row} dark={isDark} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToList(row);
          }}
          className={[
            "flex items-center gap-1.5 rounded-lg border px-[15px] py-[9px] text-sm font-medium transition-colors",
            isDark
              ? "bg-white text-[#171717] border-white hover:bg-[#ededed]"
              : "bg-white text-[#171717] border-[#ebebeb] hover:bg-[#171717] hover:text-white hover:border-[#171717]",
          ].join(" ")}
        >
          <BookmarkPlusIcon className="size-4" />
          Add to list
        </button>
      </div>
    </div>
  );
}

export default function ChartTable({
  page,
  setPage,
  data,
  isLoading,
  isError,
  error,
  isFetching,
  refetch,
  onRowClick,
}) {
  const [selected, setSelected] = useState(new Set());
  const masterRef = useRef(null);
  const { user } = useAuth();
  const isGuest = !user;
  const topRef = useRef(null);

  // Clear row selection whenever the page changes
  useEffect(() => {
    setSelected(new Set());
  }, [page]);

  const results = data?.results ?? [];
  const isFirstPage = page === 1;
  const showPodium = isFirstPage && results.length >= 3;
  const podiumRows = showPodium ? results.slice(0, 3) : [];
  const tableRows = results;
  const rowIds = results.map((r) => r.id);

  useEffect(() => {
    if (!masterRef.current) return;
    const allSelected =
      rowIds.length > 0 && rowIds.every((id) => selected.has(id));
    const someSelected = rowIds.some((id) => selected.has(id));
    masterRef.current.checked = allSelected;
    masterRef.current.indeterminate = !allSelected && someSelected;
  }, [selected, rowIds]);

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const allSelected = rowIds.every((id) => selected.has(id));
    setSelected(allSelected ? new Set() : new Set(rowIds));
  }

  function handleBulkAdd() {
    // TODO: replace with sonner toast when installed
    console.log("Bulk add:", [...selected]);
  }

  function handleAddSingle(row) {
    // TODO: replace with sonner toast when installed
    console.log("Add to list:", row.name);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-baseline justify-between mb-4.5">
            <div className="h-7 w-40 rounded bg-muted animate-pulse" />
            <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {Array.from({ length: 3 }, (_, i) => (
              <PodiumSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <table className="w-full table-auto">
            <tbody>
              {Array.from({ length: 7 }, (_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
        <AlertCircleIcon className="size-8 text-destructive" />
        <p className="text-sm font-medium text-destructive">
          {error?.message ?? "Failed to load chart data."}
        </p>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <RefreshCwIcon className="size-3" />
          Try again
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background px-6 py-14 text-center">
        <InboxIcon className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          No chart data available for these filters.
        </p>
        <p className="text-xs text-muted-foreground">
          Try a different country or category.
        </p>
      </div>
    );
  }

  const selectedCount = selected.size;
  const currentPage = data?.current_page ?? page;
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? results.length;

  return (
    <div ref={topRef} className="flex flex-col gap-6">
      {/* ── Podium (top 3) ─────────────────────────────────────────────── */}
      {showPodium && (
        <div>
          <div className="flex items-baseline justify-between mb-4.5">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Top of the chart.
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              This week's leaders
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {podiumRows.map((row, i) => (
              <PodiumCard
                key={row.id}
                row={row}
                isFirst={i === 0}
                isSelected={selected.has(row.id)}
                onToggle={toggleRow}
                onAddToList={handleAddSingle}
                onRowClick={onRowClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground text-xl">
            The full chart.
          </span>
          <div className="flex items-center gap-2">
            <span>
              {selectedCount > 0
                ? `${selectedCount} of ${results.length} selected`
                : `${total.toLocaleString()} podcasts`}
            </span>
            <button
              onClick={handleBulkAdd}
              disabled={selectedCount === 0}
              className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Add to list
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card chart-glow">
          {/* Desktop table — hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <th className="w-10 pl-4 pr-2 py-2.5 text-left">
                    <input
                      ref={masterRef}
                      type="checkbox"
                      onChange={toggleAll}
                      aria-label="Select all"
                      className="size-4 rounded border-border accent-primary"
                    />
                  </th>
                  <th className="w-10 pr-3 py-2.5 text-right font-medium">#</th>
                  <th className="py-2.5 pr-4" />
                  <th className="py-2.5 pr-6 text-left font-medium">Podcast</th>
                  <th className="py-2.5 pr-6 text-left font-medium">On</th>
                  <th className="py-2.5 pr-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tableRows.map((row) => (
                  <ChartRow
                    key={row.id}
                    row={row}
                    isSelected={selected.has(row.id)}
                    onToggle={toggleRow}
                    onRowClick={onRowClick}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list — hidden on desktop */}
          <div className="md:hidden divide-y divide-border">
            {tableRows.map((row) => (
              <ChartRowCard
                key={row.id}
                row={row}
                isSelected={selected.has(row.id)}
                onToggle={toggleRow}
                onRowClick={onRowClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="border-t border-border">
              {isGuest ? (
                /* Guest gate — full-width CTA, works on both mobile and desktop */
                <div className="flex flex-col items-center gap-2 px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {lastPage - 1} more page{lastPage - 1 !== 1 ? "s" : ""}{" "}
                      available
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sign in to browse the full chart
                    </p>
                  </div>
                  <a
                    href="/login"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Sign in to continue
                  </a>
                </div>
              ) : (
                /* Logged-in pagination — unchanged */
                <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
                  <span>
                    Page {currentPage} of {lastPage}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        requestAnimationFrame(() =>
                          topRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          }),
                        );
                      }}
                      disabled={currentPage <= 1}
                      className="rounded-md border border-border px-2.5 py-1 font-medium hover:bg-muted disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setPage((p) => Math.min(lastPage, p + 1));
                        requestAnimationFrame(() =>
                          topRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          }),
                        );
                      }}
                      disabled={currentPage >= lastPage}
                      className="rounded-md border border-border px-2.5 py-1 font-medium hover:bg-muted disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
