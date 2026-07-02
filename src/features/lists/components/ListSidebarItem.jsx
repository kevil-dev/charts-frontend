"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";

const COLORS = ["#0070f3", "#00dfd8", "#7928ca", "#ff0080", "#ff4d4d", "#f9cb28"];

function colorFromInitial(title = "") {
  const initial = title.charCodeAt(0) || 0;
  return COLORS[initial % COLORS.length];
}

function ArtworkCell({ artworkUrl, title }) {
  if (artworkUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={artworkUrl} alt="" className="size-full object-cover" />
    );
  }
  return (
    <div
      className="flex size-full items-center justify-center text-[8px] font-bold text-white"
      style={{ background: colorFromInitial(title) }}
      aria-hidden="true"
    >
      {(title?.[0] ?? "?").toUpperCase()}
    </div>
  );
}

export default function ListSidebarItem({ list, isActive, onDelete }) {
  const items = list.items ?? [];

  function handleDelete(e) {
    e.stopPropagation();
    onDelete(list);
  }

  return (
    <div
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 ${
        isActive ? "bg-white/10" : "hover:bg-white/5"
      }`}
    >
      <Link href={`/lists/${list.id}`} className="flex flex-1 min-w-0 items-center gap-3">
        <div className="grid size-8 shrink-0 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArtworkCell key={i} artworkUrl={items[i]?.artwork_url} title={list.title} />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm ${
              isActive ? "font-medium text-white" : "text-white"
            }`}
          >
            {list.title}
          </p>
          <p className="text-xs text-white/40">
            {list.item_count} {list.item_count === 1 ? "show" : "shows"}
          </p>
        </div>
      </Link>

      {isActive && (
        <span
          className="size-1.5 shrink-0 rounded-full bg-white transition-opacity group-hover:opacity-0"
          aria-hidden="true"
        />
      )}

      <button
        onClick={handleDelete}
        aria-label="Delete list"
        className="shrink-0 rounded p-1 text-white/40 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
