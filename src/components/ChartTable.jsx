"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircleIcon, RefreshCwIcon, InboxIcon } from "lucide-react";
import { useCharts } from "@/hooks/useCharts";
import ChartRow from "@/components/ChartRow";

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
        <div className="size-10 rounded-full bg-muted" />
      </td>
      <td className="py-3 pr-6 min-w-0">
        <div className="h-4 w-48 rounded bg-muted mb-1.5" />
        <div className="h-3 w-32 rounded bg-muted" />
      </td>
      <td className="py-3 pr-6">
        <div className="flex gap-2">
          <div className="size-4 rounded bg-muted" />
          <div className="size-4 rounded bg-muted" />
        </div>
      </td>
      <td className="py-3 pr-4">
        <div className="h-6 w-16 rounded bg-muted ml-auto" />
      </td>
    </tr>
  );
}

function formatRunDate(runDate) {
  if (!runDate) return null;
  try {
    return new Date(runDate + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return runDate;
  }
}

export default function ChartTable({ platform, country, category }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const masterRef = useRef(null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [platform, country, category]);

  const { data, isLoading, isError, error, isFetching, refetch } = useCharts({
    platform,
    country,
    category,
    page,
  });

  const results = data?.results ?? [];
  const rowIds  = results.map((r, i) => r.id ?? i + 1);

  // Keep master checkbox indeterminate state in sync
  useEffect(() => {
    if (!masterRef.current) return;
    const allSelected  = rowIds.length > 0 && rowIds.every((id) => selected.has(id));
    const someSelected = rowIds.some((id) => selected.has(id));
    masterRef.current.checked       = allSelected;
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
    // TODO: replace with sonner toast — toast.success(`${selected.size} podcasts added`)
    console.log("Bulk add:", [...selected]);
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <table className="w-full table-auto">
          <tbody>
            {Array.from({ length: 7 }, (_, i) => <SkeletonRow key={i} />)}
          </tbody>
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

  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background px-6 py-14 text-center">
        <InboxIcon className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">No chart data available for these filters.</p>
        <p className="text-xs text-muted-foreground">
          Try a different country or category.
        </p>
      </div>
    );
  }

  const selectedCount  = selected.size;
  const currentPage    = data?.current_page ?? page;
  const lastPage       = data?.last_page ?? 1;
  const total          = data?.total ?? results.length;
  const runDate        = formatRunDate(data?.run_date);

  return (
    <div className="flex flex-col gap-3">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {runDate && <span>Last updated: {runDate}</span>}
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1">
              <RefreshCwIcon className="size-3 animate-spin" />
              Refreshing…
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{selectedCount > 0 ? `${selectedCount} of ${results.length} selected` : `${total.toLocaleString()} podcasts`}</span>
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
              {results.map((row, i) => {
                const rank = (currentPage - 1) * (data?.per_page ?? 50) + i + 1;
                const id   = row.id ?? rank;
                return (
                  <ChartRow
                    key={id}
                    row={row}
                    rank={rank}
                    isSelected={selected.has(id)}
                    onToggle={toggleRow}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span>
              Page {currentPage} of {lastPage}
            </span>
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
  );
}
