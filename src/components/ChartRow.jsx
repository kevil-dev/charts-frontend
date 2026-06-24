"use client";

import { useState } from "react";
import Image from "next/image";
import { UserIcon, MapPinIcon } from "lucide-react";

function nameToHue(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function ArtworkFallback({ name, size = 10 }) {
  const hue = nameToHue(name);
  return (
    <div
      className={`flex size-${size} shrink-0 items-center justify-center rounded-full text-sm font-bold text-white`}
      style={{ background: `hsl(${hue}deg 55% 45%)` }}
      aria-hidden="true"
    >
      {(name?.[0] ?? "?").toUpperCase()}
    </div>
  );
}

export function Artwork({ src, name, size = 10 }) {
  const [errored, setErrored] = useState(false);
  const px = size * 4;

  if (!src || errored) return <ArtworkFallback name={name} size={size} />;

  return (
    <div className={`relative size-${size} shrink-0 overflow-hidden rounded-full`}>
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
      <span className={`${base} ${overlay ? "size-4 bg-green-600" : "h-4 px-1.5 bg-green-50 text-green-600"}`}>▲</span>
    );
  }
  if (rankMove === "DOWN") {
    return (
      <span className={`${base} ${overlay ? "size-4 bg-red-500" : "h-4 px-1.5 bg-red-50 text-red-500"}`}>▼</span>
    );
  }
  if (rankMove === "NEW") {
    return (
      <span className={`${base} ${overlay ? "size-4 bg-blue-500 text-[8px]" : "h-4 px-1.5 bg-blue-50 text-blue-500"}`}>NEW</span>
    );
  }
  return null;
}

const AppleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 14.5a7.5 7.5 0 0 1-5.4-2.3 5 5 0 0 1 10.8 0A7.5 7.5 0 0 1 12 20.5z"/>
  </svg>
);

const SpotifyIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.42-5.303-1.74-8.785-.953a.622.622 0 1 1-.277-1.215c3.808-.87 7.076-.495 9.712 1.104a.623.623 0 0 1 .207.857zm1.223-2.742a.779.779 0 0 1-1.07.257C14.39 12.3 10.278 11.82 7.1 12.76a.78.78 0 0 1-.456-1.489c3.624-1.112 8.147-.573 11.234 1.34a.78.78 0 0 1 .257 1.07h-.326zm.105-2.855C14.69 8.95 9.375 8.775 6.297 9.71a.937.937 0 1 1-.543-1.794c3.537-1.072 9.416-.865 13.13 1.34a.937.937 0 0 1-.97 1.61z"/>
  </svg>
);

const YouTubeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const PLATFORM_DEFS = [
  {
    key: "apple",
    hoverColor: "hover:text-purple-500",
    Icon: AppleIcon,
  },
  {
    key: "spotify",
    hoverColor: "hover:text-green-500",
    Icon: SpotifyIcon,
  },
  {
    key: "youtube",
    hoverColor: "hover:text-red-500",
    Icon: YouTubeIcon,
  },
];

export function PlatformIcon({ row, className = "size-4" }) {
  const platformLinks = [
    {
      key: "apple",
      show: row.on_apple,
      href: row.apple_url || null,
      label: "Listen on Apple Podcasts",
      hoverColor: "hover:text-purple-500",
      Icon: AppleIcon,
    },
    {
      key: "spotify",
      show: row.on_spotify,
      href: row.spotify_id ? `https://open.spotify.com/show/${row.spotify_id}` : null,
      label: "Listen on Spotify",
      hoverColor: "hover:text-green-500",
      Icon: SpotifyIcon,
    },
    {
      key: "youtube",
      show: row.on_youtube,
      href: row.youtube_url || null,
      label: "Listen on YouTube",
      hoverColor: "hover:text-red-500",
      Icon: YouTubeIcon,
    },
  ];

  const visible = platformLinks.filter((p) => p.show);
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-2 min-w-24">
      {visible.map(({ key, href, label, hoverColor, Icon }) =>
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`text-muted-foreground transition-colors ${hoverColor}`}
          >
            <Icon className={className} />
          </a>
        ) : (
          <span key={key} className="cursor-default text-muted-foreground">
            <Icon className={className} />
          </span>
        )
      )}
    </div>
  );
}

export default function ChartRow({ row, isSelected, onToggle }) {
  function handleAddToList() {
    // TODO: replace with sonner toast when installed
    console.log("Add to list:", row.name);
  }

  return (
    <tr
      className={[
        "group transition-colors",
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
          onChange={() => onToggle(row.id)}
          aria-label={`Select ${row.name}`}
          className="size-4 rounded border-border accent-primary"
        />
      </td>

      {/* Rank */}
      <td className="w-10 pr-3 text-right font-mono text-sm text-muted-foreground">
        {row.chart_rank}
      </td>

      {/* Artwork + rank_move badge */}
      <td className="py-3 pr-4">
        <div className="relative inline-block">
          <Artwork src={row.artwork} name={row.name} size={10} />
          <div className="absolute -bottom-1 -right-1">
            <RankMoveBadge rankMove={row.rank_move} overlay />
          </div>
        </div>
      </td>

      {/* Name + artist + location */}
      <td className="min-w-0 py-3 pr-6">
        <p className="truncate text-sm font-semibold leading-tight">{row.name}</p>
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
        <button
          onClick={handleAddToList}
          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Add to list
        </button>
      </td>
    </tr>
  );
}
