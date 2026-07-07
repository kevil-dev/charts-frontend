"use client";

import { useState } from "react";
import Image from "next/image";
import { BookmarkPlusIcon, CheckIcon } from "lucide-react";
import { PlatformIcon, RankMoveBadge } from "./ChartRow";
import AddToListDropdown from "@/components/lists/AddToListDropdown";

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

  return (
    <div
      onClick={() => onRowClick?.(row)}
      className={[
        "rounded-[20px] p-6 flex flex-col relative cursor-pointer group transition-all duration-300 h-full",
        "bg-[oklch(15%_0.05_280)] text-white",
        isSelected 
          ? "border-[oklch(60%_0.25_280)] shadow-[0_8px_30px_oklch(60%_0.25_280/0.25)] ring-1 ring-[oklch(60%_0.25_280)]"
          : "border border-white/10 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 hover:border-white/20",
      ].join(" ")}
    >
      {/* Giant Background Number for Boldness */}
      <div 
        className="absolute top-2 -right-2 text-[140px] font-black leading-none select-none pointer-events-none transition-colors duration-300 tracking-tighter"
        style={{ color: isSelected ? "oklch(60% 0.25 280 / 0.3)" : "rgba(255,255,255,0.12)" }}
      >
        {row.chart_rank}
      </div>

      {/* Checkbox — top-left absolute */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(row.id);
          }}
          aria-label={isSelected ? `Deselect ${row.name}` : `Select ${row.name}`}
          className={[
            "flex size-7 items-center justify-center rounded-full border transition-all duration-200",
            isSelected
              ? "bg-[oklch(60%_0.25_280)] border-[oklch(60%_0.25_280)] text-white scale-110"
              : "bg-white/10 backdrop-blur-sm border-white/20 text-transparent hover:border-white/40",
          ].join(" ")}
        >
          <CheckIcon strokeWidth={3} className="size-3.5" />
        </button>
      </div>

      {/* Artwork */}
      <div className="relative z-10 self-center mb-5 mt-2 transition-transform duration-300 group-hover:scale-105">
        {row.artwork && !artworkError ? (
          <Image
            src={row.artwork}
            alt={row.name}
            width={120}
            height={120}
            priority={isFirst}
            className="size-[100px] sm:size-[120px] rounded-full object-cover shadow-lg border-4 border-white"
            onError={() => setArtworkError(true)}
          />
        ) : (
          <div className="size-[100px] sm:size-[120px] rounded-full flex items-center justify-center text-3xl font-bold bg-muted text-muted-foreground shadow-lg border-4 border-white">
            {(row.name?.[0] ?? "?").toUpperCase()}
          </div>
        )}
        
        {/* Rank movement badge on top of artwork */}
        <div className="absolute -bottom-2 inset-x-0 flex justify-center">
          <RankMoveBadge rankMove={row.rank_move} />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col items-center text-center z-10 pt-2 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[oklch(60%_0.25_280)] mb-1.5">
          #{row.chart_rank}
        </p>
        <p className="text-lg font-bold leading-[1.15] tracking-tight line-clamp-2 text-white group-hover:text-[oklch(60%_0.25_280)] transition-colors">
          {row.name}
        </p>
        {row.artist_or_publisher && (
          <p className="mt-1.5 text-sm font-medium tracking-tight text-white/60 line-clamp-1">
            {row.artist_or_publisher}
          </p>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between z-10 w-full pt-4 border-t border-white/10">
        <PlatformIcon row={row} dark={true} />
        <div className="relative">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setAddOpen((v) => !v); }}
            className={[
              "flex items-center justify-center size-9 rounded-full transition-colors",
              "text-white/40 hover:bg-white/10 hover:text-[oklch(60%_0.25_280)]",
            ].join(" ")}
          >
            <BookmarkPlusIcon className="size-4.5" />
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