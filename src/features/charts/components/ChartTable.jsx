"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  AlertCircleIcon,
  RefreshCwIcon,
  InboxIcon,
} from "lucide-react";
import ChartRow, {
  PlatformIcon,
  RankMoveBadge,
  ChartRowCard,
} from "./ChartRow";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PodiumSkeleton,SkeletonRow } from "./ChartsSkeletons";
import PodiumCard from "./PodiumCard";
import AddToListDropdown from "@/features/lists/components/AddToListDropdown";

export default function ChartTable({
  page,
  data,
  isLoading,
  isError,
  error,
  isFetching,
  refetch,
  onRowClick,
  platform,
}) {
  const [selected, setSelected] = useState(new Set());
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
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
  const rowIds = useMemo(() => results.map((r) => r.id), [results]);

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

  const selectedRows = useMemo(
    () => results.filter((r) => selected.has(r.id)),
    [results, selected]
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(pageNumber) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNumber));
    router.push(`${pathname}?${params.toString()}`);
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
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
                onRowClick={onRowClick}
                platform={platform}
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
            <div className="relative">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); if (selectedCount > 0) setBulkAddOpen((v) => !v); }}
                disabled={selectedCount === 0}
                className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity disabled:opacity-40"
              >
                Add to list
              </button>
              <AddToListDropdown
                rows={selectedRows}
                platform={platform}
                open={bulkAddOpen}
                onClose={() => setBulkAddOpen(false)}
                anchorClassName="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover shadow-lg"
              />
            </div>
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
                    platform={platform}
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
                platform={platform}
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
                    href={`/login?from=${pathname}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Sign in to continue
                  </a>
                </div>
              ) : (
                /* Logged-in pagination — unchanged */
                /* Logged-in pagination — URL driven */
                <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
                  <span>
                    Page {currentPage} of {lastPage}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="rounded-md border border-border px-2.5 py-1 font-medium hover:bg-muted disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
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
