"use client";

import { useState } from "react";
import Image from "next/image";
import { BookmarkPlusIcon } from "lucide-react";
import { PlatformIcon, RankMoveBadge } from "./ChartRow";
import AddToListDropdown from "@/features/lists/components/AddToListDropdown";

export default function PodiumCard({
  row,
  isFirst,
  isSelected,
  onToggle,
  onRowClick,
  platform,
}) {
  const [artworkError, setArtworkError] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const isDark = isFirst;

  return (
    <div
      onClick={() => onRowClick?.(row)}
      className={[
        "rounded-xl p-[22px] flex flex-col relative cursor-pointer",
        isDark
          ? "bg-[#171717] text-white border border-[#2a2a2e] shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
          : "bg-white border border-border text-foreground shadow-[0_2px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]",
      ].join(" ")}
    >
      {/* Checkbox — top-right absolute */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(row.id);
          }}
          aria-label={isSelected ? `Deselect ${row.name}` : `Select ${row.name}`}
          className={[
            "flex size-7 items-center justify-center rounded-lg border transition-colors",
            isSelected
              ? isDark
                ? "bg-white border-white text-[#171717]"
                : "bg-[#171717] border-[#171717] text-white"
              : isDark
              ? "border-white/20 text-white/40 hover:border-white/60"
              : "border-border text-transparent hover:border-foreground/40",
          ].join(" ")}
        >
          {isSelected && (
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Rank + artwork + name */}
      <div className="flex items-start gap-4.5 pr-8">
        <div className="relative shrink-0">
          {row.artwork && !artworkError ? (
            <Image
              src={row.artwork}
              alt={row.name}
              width={56}
              height={56}
              priority={isFirst}
              className="size-14 rounded-full object-cover"
              onError={() => setArtworkError(true)}
            />
          ) : (
            <div className={`size-14 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? "bg-white/10 text-white" : "bg-muted text-muted-foreground"}`}>
              {(row.name?.[0] ?? "?").toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-mono uppercase tracking-[0.06em] ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
            #{row.chart_rank}
          </p>
          <p className={`mt-0.5 text-base font-semibold leading-tight tracking-[-0.02em] line-clamp-2 ${isDark ? "text-white" : "text-foreground"}`}>
            {row.name}
          </p>
          {row.artist_or_publisher && (
            <p className={`mt-1.75 text-sm tracking-[-0.01em] leading-[1.4] ${isDark ? "text-[#a1a1a1]" : "text-muted-foreground"}`}>
              {row.artist_or_publisher}
            </p>
          )}
        </div>
      </div>

      {/* Rank movement badge */}
      <div className="mt-4 self-start">
        <RankMoveBadge rankMove={row.rank_move} />
      </div>

      {/* Divider */}
      <div className={`h-px my-5 ${isDark ? "bg-white/[12%]" : "bg-[#ebebeb]"}`} />

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <PlatformIcon row={row} dark={isDark} />
        <div className="relative">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setAddOpen((v) => !v); }}
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
          <AddToListDropdown
            rows={[row]}
            platform={platform}
            open={addOpen}
            onClose={() => setAddOpen(false)}
            anchorClassName="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}