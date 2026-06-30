"use client";

import { useState } from "react";
import Image from "next/image";
import { UserIcon, MapPinIcon, Trash2Icon, BookmarkPlusIcon } from "lucide-react";
import AddToListDropdown from "@/features/lists/components/AddToListDropdown";

const SIZE_CLASSES = {
  8: "size-8",
  10: "size-10",
  14: "size-14",
  20: "size-20",
};

// Gradient palette for square avatar fallbacks — indexed by (rank % 8)
const GRADIENTS = [
  ["#0070f3", "#00dfd8"], // rank % 8 === 0
  ["#007cf0", "#00dfd8"], // rank % 8 === 1
  ["#7928ca", "#ff0080"], // rank % 8 === 2
  ["#ff4d4d", "#f9cb28"], // rank % 8 === 3
  ["#007cf0", "#7928ca"], // rank % 8 === 4
  ["#ff0080", "#ff4d4d"], // rank % 8 === 5
  ["#00dfd8", "#007cf0"], // rank % 8 === 6
  ["#7928ca", "#4c2889"], // rank % 8 === 7
];

function nameToHue(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function ArtworkFallback({ name, size = 10, square = false, rank = 1 }) {
  if (square) {
    const [colorA, colorB] = GRADIENTS[rank % 8];
    return (
      <div
        className={`flex ${SIZE_CLASSES[size] ?? "size-10"} shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white`}
        style={{
          background: `linear-gradient(135deg, ${colorA} 0%, ${colorB} 100%)`,
        }}
        aria-hidden="true"
      >
        {(name?.[0] ?? "?").toUpperCase()}
      </div>
    );
  }
  const hue = nameToHue(name);
  return (
    <div
      className={`flex ${SIZE_CLASSES[size] ?? "size-10"} shrink-0 items-center justify-center rounded-full text-sm font-bold text-white`}
      style={{ background: `hsl(${hue}deg 55% 45%)` }}
      aria-hidden="true"
    >
      {(name?.[0] ?? "?").toUpperCase()}
    </div>
  );
}

export function Artwork({ src, name, size = 10, square = false, rank = 1 }) {
  const [errored, setErrored] = useState(false);
  const px = size * 4;

  if (!src || errored)
    return (
      <ArtworkFallback name={name} size={size} square={square} rank={rank} />
    );

  return (
    <div
      className={`relative ${SIZE_CLASSES[size] ?? "size-10"} shrink-0 overflow-hidden ${square ? "rounded-lg" : "rounded-full"}`}
    >
      <Image
        src={src}
        alt={name}
        fill
        sizes={`${px}px`}
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

export function RankMoveBadge({ rankMove, overlay = false }) {
  const base = overlay
    ? "absolute -bottom-1 -right-1 flex items-center justify-center rounded-full text-[9px] leading-none text-white"
    : "inline-flex items-center justify-center rounded-full text-[9px] leading-none font-medium";

  if (rankMove === "UP") {
    return (
      <span
        className={`${base} ${overlay ? "size-4 bg-green-600" : "h-4 px-1.5 bg-green-50 text-green-600"}`}
      >
        ▲
      </span>
    );
  }
  if (rankMove === "DOWN") {
    return (
      <span
        className={`${base} ${overlay ? "size-4 bg-red-500" : "h-4 px-1.5 bg-red-50 text-red-500"}`}
      >
        ▼
      </span>
    );
  }
  if (rankMove === "NEW") {
    return (
      <span
        className={`${base} ${overlay ? "size-4 bg-blue-500 text-[8px]" : "h-4 px-1.5 bg-blue-50 text-blue-500"}`}
      >
        NEW
      </span>
    );
  }
  return null;
}

// Inline brand SVGs — lucide-react has no accurate equivalents
const AppleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59.12 2.2.007 2.864a8.506 8.506 0 01-3.24 5.296c-.608.46-2.096 1.261-2.336 1.261-.088 0-.096-.091-.056-.46.072-.592.144-.715.48-.856.536-.224 1.448-.874 2.008-1.435a7.644 7.644 0 002.008-3.536c.208-.824.184-2.656-.048-3.504-.728-2.696-2.928-4.792-5.624-5.352-.784-.16-2.208-.16-3 0-2.728.56-4.984 2.76-5.672 5.528-.184.752-.184 2.584 0 3.336.456 1.832 1.64 3.512 3.192 4.512.304.2.672.408.824.472.336.144.408.264.472.856.04.36.03.464-.056.464-.056 0-.464-.176-.896-.384l-.04-.03c-2.472-1.216-4.056-3.274-4.632-6.012-.144-.706-.168-2.392-.03-3.04.36-1.74 1.048-3.1 2.192-4.304 1.648-1.737 3.768-2.656 6.128-2.656zm.134 2.81c.409.004.803.04 1.106.106 2.784.62 4.76 3.408 4.376 6.174-.152 1.114-.536 2.03-1.216 2.88-.336.43-1.152 1.15-1.296 1.15-.023 0-.048-.272-.048-.603v-.605l.416-.496c1.568-1.878 1.456-4.502-.256-6.224-.664-.67-1.432-1.064-2.424-1.246-.64-.118-.776-.118-1.448-.008-1.02.167-1.81.562-2.512 1.256-1.72 1.704-1.832 4.342-.264 6.222l.413.496v.608c0 .336-.027.608-.06.608-.03 0-.264-.16-.512-.36l-.034-.011c-.832-.664-1.568-1.842-1.872-2.997-.184-.698-.184-2.024.008-2.72.504-1.878 1.888-3.335 3.808-4.019.41-.145 1.133-.22 1.814-.211zm-.13 2.99c.31 0 .62.06.844.178.488.253.888.745 1.04 1.259.464 1.578-1.208 2.96-2.72 2.254h-.015c-.712-.331-1.096-.956-1.104-1.77 0-.733.408-1.371 1.112-1.745.224-.117.534-.176.844-.176zm-.011 4.728c.988-.004 1.706.349 1.97.97.198.464.124 1.932-.218 4.302-.232 1.656-.36 2.074-.68 2.356-.44.39-1.064.498-1.656.288h-.003c-.716-.257-.87-.605-1.164-2.644-.341-2.37-.416-3.838-.218-4.302.262-.616.974-.966 1.97-.97z"/>
  </svg>
);

const SpotifyIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const YouTubeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const ICON_MAP = {
  apple: AppleIcon,
  spotify: SpotifyIcon,
  youtube: YouTubeIcon,
};

export function PlatformIcon({ row, className = "size-4 ", dark = false }) {
  const platformLinks = [
    {
      key: "apple",
      show: row.on_apple,
      href: row.apple_url || null,
      label: "Listen on Apple Podcasts",
      hoverColor: "hover:text-purple-500",
    },
    {
      key: "spotify",
      show: row.on_spotify,
      href: row.spotify_id
        ? `https://open.spotify.com/show/${row.spotify_id}`
        : null,
      label: "Listen on Spotify",
      hoverColor: "hover:text-green-500",
    },
    {
      key: "youtube",
      show: row.on_youtube,
      href: row.youtube_url || null,
      label: "Listen on YouTube",
      hoverColor: "hover:text-red-500",
    },
  ];

  const visible = platformLinks.filter((p) => p.show);
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-2 min-w-22.5">
      {visible.map(({ key, href, label, hoverColor }) => {
        const Icon = ICON_MAP[key];
        const hoverClass = dark ? "hover:text-white" : hoverColor;
        return href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`text-[#a1a1a1] transition-colors ${hoverClass}`}
          >
            <Icon className={className} />
          </a>
        ) : (
          <span key={key} className="cursor-default text-[#a1a1a1]">
            <Icon className={className} />
          </span>
        );
      })}
    </div>
  );
}

export default function ChartRow({ row, isSelected, onToggle, onRowClick, platform }) {
  const [addOpen, setAddOpen] = useState(false);
  const showBadge = row.rank_move === "UP" || row.rank_move === "DOWN";

  return (
    <tr
      onClick={() => onRowClick?.(row)}
      className={[
        "group transition-colors cursor-pointer",
        isSelected
          ? "border-l-2 border-l-primary bg-primary/5"
          : "hover:bg-muted/40",
      ].join(" ")}
    >
      {/* Checkbox */}
      <td className="w-10 pl-4 pr-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(row.id);
          }}
          aria-label={`Select ${row.name}`}
          className="size-4 rounded border-border accent-primary"
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* Rank */}
      <td className="w-10 pr-3 text-right font-mono text-sm text-muted-foreground">
        {row.chart_rank}
      </td>

      {/* Square artwork + trend badge */}
      <td className="py-3 pr-4">
        <div className="relative inline-block">
          <Artwork
            src={row.artwork}
            name={row.name}
            size={10}
            square
            rank={row.chart_rank}
          />
          {showBadge && (
            <div
              className={[
                "absolute -bottom-1 -right-1 flex size-4.75 items-center justify-center",
                "rounded-full border-2 border-white shadow-sm",
                row.rank_move === "UP" ? "bg-[#0070f3]" : "bg-[#ee0000]",
              ].join(" ")}
            >
              {row.rank_move === "UP" ? (
                <svg
                  viewBox="0 0 10 10"
                  className="size-2.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                >
                  <path d="M2 6.5 5 3.5 8 6.5" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 10 10"
                  className="size-2.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                >
                  <path d="M2 3.5 5 6.5 8 3.5" />
                </svg>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Name + artist + location */}
      <td className="min-w-0 py-3 pr-6">
        <p className="truncate text-sm font-semibold leading-tight">
          {row.name}
        </p>
        {row.artist_or_publisher && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <UserIcon className="size-3 shrink-0" aria-hidden="true" />
            {row.artist_or_publisher}
          </p>
        )}
        {row.country_name && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPinIcon className="size-3 shrink-0" aria-hidden="true" />
            {row.country_name}
          </p>
        )}
      </td>

      {/* Platform icons */}
      <td className="py-3 pr-6">
        <PlatformIcon row={row} />
      </td>

      {/* Add to list */}
      <td className="py-3 pr-4 text-right">
        <div className="relative inline-block">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setAddOpen((v) => !v); }}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
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
      </td>
    </tr>
  );
}

export function ChartRowCard({ row, isSelected, onToggle, onRowClick, listMode = false, onDelete, platform }) {
  const [addOpen, setAddOpen] = useState(false);
  const showBadge =
    !listMode &&
    (row.rank_move === "UP" ||
      row.rank_move === "DOWN" ||
      row.rank_move === "NEW");

  return (
    <div
      onClick={() => !listMode && onRowClick?.(row)}
      className={[
        "group flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors",
        listMode ? "cursor-default" : "cursor-pointer",
        isSelected && !listMode
          ? "bg-primary/5 border-l-2 border-l-primary"
          : "hover:bg-muted/40",
      ].join(" ")}
    >
      {/* Checkbox — hidden in list mode */}
      {!listMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(row.id);
          }}
          aria-label={`Select ${row.name}`}
          className="size-4 shrink-0 rounded border-border accent-primary"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Rank — hidden in list mode */}
      {!listMode && (
        <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">
          {row.chart_rank}
        </span>
      )}

      {/* Artwork — badge hidden in list mode */}
      <div className="relative shrink-0">
        <Artwork
          src={row.artwork}
          name={row.name}
          size={10}
          square
          rank={row.chart_rank ?? 1}
        />
        {showBadge && (
          <div
            className={[
              "absolute -bottom-1 -right-1 flex size-4 items-center justify-center",
              "rounded-full border-2 border-background shadow-sm",
              row.rank_move === "UP"
                ? "bg-[#0070f3]"
                : row.rank_move === "NEW"
                  ? "bg-blue-500"
                  : "bg-[#ee0000]",
            ].join(" ")}
          >
            {row.rank_move === "UP" ? (
              <svg
                viewBox="0 0 10 10"
                className="size-2"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
              >
                <path d="M2 6.5 5 3.5 8 6.5" />
              </svg>
            ) : row.rank_move === "NEW" ? (
              <span className="text-[6px] font-bold text-white leading-none">
                N
              </span>
            ) : (
              <svg
                viewBox="0 0 10 10"
                className="size-2"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
              >
                <path d="M2 3.5 5 6.5 8 3.5" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Name + publisher */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">
          {row.name}
        </p>
        {row.artist_or_publisher && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {row.artist_or_publisher}
          </p>
        )}
      </div>

      {/* Platform icons */}
      <div className="shrink-0">
        <PlatformIcon row={row} className="size-3.5" />
      </div>

      {/* Add to list — only in chart mode */}
      {!listMode && (
        <div className="relative shrink-0">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setAddOpen((v) => !v); }}
            aria-label={`Add ${row.name} to list`}
            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BookmarkPlusIcon className="size-4" />
          </button>
          <AddToListDropdown
            rows={[row]}
            platform={platform}
            open={addOpen}
            onClose={() => setAddOpen(false)}
            anchorClassName="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover shadow-lg"
          />
        </div>
      )}

      {/* Delete button — only in list mode when a handler is provided */}
      {listMode && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          aria-label={`Remove ${row.name} from list`}
          className="ml-1 shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2Icon className="size-4" />
        </button>
      )}
    </div>
  );
}
