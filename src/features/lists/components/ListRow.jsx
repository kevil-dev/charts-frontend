"use client";

import { ChartRowCard } from "@/features/charts/components/ChartRow";

export default function ListRow({ item, onDelete }) {
  const row = {
    name: item.podcast_name,
    artist_or_publisher: item.podcast_author,
    artwork: item.artwork_url,
    genre: item.genre,
    match_key: item.match_key,
    on_apple:    item.on_apple    ?? (item.platform === "apple"),
    apple_url:   item.apple_url   ?? null,
    on_spotify:  item.on_spotify  ?? (item.platform === "spotify"),
    spotify_id:  item.spotify_id  ?? null,
    on_youtube:  item.on_youtube  ?? (item.platform === "youtube"),
    youtube_url: item.youtube_url ?? null,
  };

  return (
    <ChartRowCard
      row={row}
      listMode={true}
      onDelete={() => onDelete?.(item)}
    />
  );
}
