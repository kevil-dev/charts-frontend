"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircleIcon, RefreshCwIcon, InboxIcon } from "lucide-react";
import { useCharts } from "@/hooks/useCharts";
import ChartRow, { Artwork, RankMoveBadge, PlatformIcon } from "@/components/ChartRow";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="w-10 pl-4 pr-2 py-3"><div className="size-4 rounded bg-muted" /></td>
      <td className="w-10 pr-3 py-3"><div className="h-4 w-6 rounded bg-muted ml-auto" /></td>
      <td className="py-3 pr-4"><div className="size-10 rounded-full bg-muted" /></td>
      <td className="py-3 pr-6 min-w-0">
        <div className="h-4 w-48 rounded bg-muted mb-1.5" />
        <div className="h-3 w-32 rounded bg-muted" />
      </td>
      <td className="py-3 pr-6"><div className="size-4 rounded bg-muted" /></td>
      <td className="py-3 pr-4"><div className="h-6 w-16 rounded bg-muted ml-auto" /></td>
    </tr>
  );
}

function formatRunDate(runDate) {
  if (!runDate) return null;
  try {
    return new Date(runDate + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return runDate;
  }
}

function PodiumCard({ row, platform, isFirst, onAddToList }) {
  return (
    <div
      className={[
        "flex flex-col gap-3 rounded-2xl p-5",
        isFirst
          ? "bg-neutral-900 text-white"
          : "bg-background border border-border text-foreground",
      ].join(" ")}
    >
      {/* Rank label */}
      <span className={`font-mono text-xs ${isFirst ? "text-neutral-400" : "text-muted-foreground"}`}>
        #{row.chart_rank}
      </span>

      {/* Artwork + name */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Artwork src={row.artwork} name={row.name} size={14} />
          <div className="absolute -bottom-1 -right-1">
            <RankMoveBadge rankMove={row.rank_move} overlay />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xl font-semibold leading-tight line-clamp-2">{row.name}</p>
          {row.artist_or_publisher && (
            <p className={`mt-1 truncate text-xs ${isFirst ? "text-neutral-400" : "text-muted-foreground"}`}>
              {row.artist_or_publisher}
            </p>
          )}
        </div>
      </div>

      {/* Footer: platform icon + add button */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <PlatformIcon row={row} className="size-5" />
        <button
          onClick={() => onAddToList(row)}
          className={[
            "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            isFirst
              ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          Add to list
        </button>
      </div>
    </div>
  );
}

export default function ChartTable({ platform, country, category }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const masterRef = useRef(null);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [platform, country, category]);

  const { data, isLoading, isError, error, isFetching, refetch } = useCharts({
    platform, country, category, page,
  });

  const results = data?.results ?? [];
  const isFirstPage = page === 1;
  const showPodium = isFirstPage && results.length >= 3;
  const podiumRows = showPodium ? results.slice(0, 3) : [];
  const tableRows = showPodium ? results.slice(3) : results;
  const rowIds = results.map((r) => r.id);

  useEffect(() => {
    if (!masterRef.current) return;
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.has(id));
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
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <table className="w-full table-auto">
          <tbody>{Array.from({ length: 7 }, (_, i) => <SkeletonRow key={i} />)}</tbody>
        </table>
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
        <p className="text-sm font-medium">No chart data available for these filters.</p>
        <p className="text-xs text-muted-foreground">Try a different country or category.</p>
      </div>
    );
  }

  const selectedCount = selected.size;
  const currentPage = data?.current_page ?? page;
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? results.length;
  const runDate = formatRunDate(data?.run_date);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Podium (top 3) ─────────────────────────────────────────────── */}
      {showPodium && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Top of the chart.</h2>
          <div className="grid grid-cols-3 gap-4">
            {podiumRows.map((row, i) => (
              <PodiumCard
                key={row.id}
                row={row}
                platform={platform}
                isFirst={i === 0}
                onAddToList={handleAddSingle}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {runDate && <span>Last updated: {runDate}</span>}
            <button
              onClick={refetch}
              disabled={isFetching}
              aria-label="Refresh chart data"
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 font-medium hover:bg-muted disabled:opacity-50"
            >
              <RefreshCwIcon className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
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
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
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
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
              <span>Page {currentPage} of {lastPage}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-md border border-border px-2.5 py-1 font-medium hover:bg-muted disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage}
                  className="rounded-md border border-border px-2.5 py-1 font-medium hover:bg-muted disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
