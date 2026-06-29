"use client";

import { ChartRowCard } from "@/features/charts/components/ChartRow";

export default function ListRow({ item, onDelete }) {
  const row = {
    name: item.podcast_name,
    artist_or_publisher: item.podcast_author,
    artwork: item.artwork_url,
    genre: item.genre,
    on_apple: item.platform === "apple",
    on_spotify: item.platform === "spotify",
    on_youtube: item.platform === "youtube",
  };

  return (
    <ChartRowCard
      row={row}
      listMode={true}
      onDelete={() => onDelete?.(item)}
    />
  );
}
