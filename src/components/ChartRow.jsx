"use client";

import Image from "next/image";
import { UserIcon, MapPinIcon } from "lucide-react";
// react-icons used for brand platform icons — lucide-react has no Spotify/YouTube/Apple equivalents
import { FaApple, FaSpotify, FaYoutube } from "react-icons/fa";

/** Deterministic gradient hue from a string */
function nameToHue(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function Initials({ name }) {
  const hue = nameToHue(name);
  const initials = (name ?? "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ background: `hsl(${hue}deg 55% 45%)` }}
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
}

function TrendBadge({ row }) {
  // TODO: confirm field name — API may return row.trend ("up"|"down"|"flat")
  //       or row.position_change (positive int = up, negative = down, 0 = flat)
  const change = row.position_change ?? 0;
  const trend = row.trend ?? (change > 0 ? "up" : change < 0 ? "down" : "flat");

  if (trend === "up") {
    return (
      <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] leading-none text-white">
        ▲
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] leading-none text-white">
        ▼
      </span>
    );
  }
  return null;
}

function PlatformIcons({ row }) {
  // TODO: confirm field names — API may return boolean flags or presence of platform URLs
  const hasApple   = row.apple_url   ?? row.on_apple   ?? true;
  const hasSpotify = row.spotify_url ?? row.on_spotify ?? false;
  const hasYoutube = row.youtube_url ?? row.on_youtube ?? false;

  return (
    <div className="flex items-center gap-2">
      {hasApple && (
        <FaApple
          className="size-4 text-muted-foreground transition-colors hover:text-black dark:hover:text-white"
          aria-label="On Apple Podcasts"
        />
      )}
      {hasSpotify && (
        <FaSpotify
          className="size-4 text-muted-foreground transition-colors hover:text-[#1DB954]"
          aria-label="On Spotify"
        />
      )}
      {hasYoutube && (
        <FaYoutube
          className="size-4 text-muted-foreground transition-colors hover:text-[#FF0000]"
          aria-label="On YouTube"
        />
      )}
    </div>
  );
}

export default function ChartRow({ row, rank, isSelected, onToggle }) {
  // TODO: confirm field names from the real API response
  const name    = row.name ?? row.title ?? "Unknown Podcast"; // TODO: confirm key
  const hosts   = row.hosts ?? row.author ?? "";              // TODO: confirm key
  const location = row.location ?? row.country_name ?? "";   // TODO: confirm key
  const imageUrl = row.image_url ?? row.artwork_url ?? null; // TODO: confirm key

  function handleAddToList() {
    // TODO: replace with sonner toast when/if installed — e.g. toast.success(`${name} added`)
    console.log("Add to list:", name);
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
          onChange={() => onToggle(row.id ?? rank)}
          aria-label={`Select ${name}`}
          className="size-4 rounded border-border accent-primary"
        />
      </td>

      {/* Rank */}
      <td className="w-10 pr-3 text-right font-mono text-sm text-muted-foreground">
        {rank}
      </td>

      {/* Avatar + trend badge */}
      <td className="py-3 pr-4">
        <div className="relative inline-block">
          {imageUrl ? (
            <div className="relative size-10 overflow-hidden rounded-full">
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="40px"
                className="object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          ) : (
            <Initials name={name} />
          )}
          <TrendBadge row={row} />
        </div>
      </td>

      {/* Name + hosts + location */}
      <td className="min-w-0 py-3 pr-6">
        <p className="truncate text-sm font-semibold leading-tight">{name}</p>
        {hosts && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <UserIcon className="size-3 shrink-0" aria-hidden="true" />
            {Array.isArray(hosts) ? hosts.join(", ") : hosts}
          </p>
        )}
        {location && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPinIcon className="size-3 shrink-0" aria-hidden="true" />
            {location}
          </p>
        )}
      </td>

      {/* Platform icons */}
      <td className="py-3 pr-6">
        <PlatformIcons row={row} />
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
