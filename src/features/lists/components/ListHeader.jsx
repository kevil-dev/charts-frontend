"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LockIcon,
  Link2Icon,
  PlusIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Artwork } from "@/features/charts/components/ChartRow";

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv(list) {
  const rows = [
    ["Name", "Author", "Platform", "Genre", "Added"],
    ...(list.items ?? []).map((item) => [
      `"${(item.podcast_name ?? "").replace(/"/g, '""')}"`,
      `"${(item.podcast_author ?? "").replace(/"/g, '""')}"`,
      item.platform ?? "",
      `"${(item.genre ?? "").replace(/"/g, '""')}"`,
      item.added_at ?? "",
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  downloadFile(`${list.title ?? "list"}.csv`, csv, "text/csv");
}

function exportJson(list) {
  const json = JSON.stringify(list.items ?? [], null, 2);
  downloadFile(`${list.title ?? "list"}.json`, json, "application/json");
}

function ArtworkCell({ item, index }) {
  if (!item) {
    return (
      <div className="aspect-square w-full rounded-sm bg-muted/60" />
    );
  }
  return (
    <Artwork
      src={item.artwork_url}
      name={item.podcast_name}
      size={10}
      square
      rank={index + 1}
    />
  );
}

function InlineText({ value, onSave, maxLength, placeholder, readOnly, className, multiline }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef(null);

  function startEdit() {
    if (readOnly) return;
    setDraft(value ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== (value ?? "")) {
      onSave(trimmed);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setDraft(value ?? "");
    }
  }

  if (editing) {
    const Tag = multiline ? "textarea" : "input";
    return (
      <div className="relative w-full">
        <Tag
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
          onBlur={commit}
          onKeyDown={onKeyDown}
          maxLength={maxLength}
          rows={multiline ? 3 : undefined}
          className={`w-full resize-none rounded-md border border-border bg-background px-2 py-1 text-foreground outline-none focus:ring-2 focus:ring-ring ${className}`}
        />
        <span className="absolute right-2 bottom-1.5 text-[10px] text-muted-foreground select-none">
          {draft.length}/{maxLength}
        </span>
      </div>
    );
  }

  return (
    <span
      onClick={startEdit}
      role={readOnly ? undefined : "button"}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={(e) => e.key === "Enter" && startEdit()}
      className={`block w-full ${readOnly ? "" : "cursor-text hover:opacity-70 transition-opacity"} ${className}`}
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </span>
  );
}

export default function ListHeader({ list, onUpdate, onShareToggle, readOnly = false }) {
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);
  const items = list?.items ?? [];
  const artworkSlots = [0, 1, 2, 3].map((i) => items[i] ?? null);
  const itemCount = items.length;

  const handleTitleSave = useCallback(
    (title) => {
      if (!title) return;
      onUpdate?.({ title });
    },
    [onUpdate]
  );

  const handleDescriptionSave = useCallback(
    (description) => {
      onUpdate?.({ description });
    },
    [onUpdate]
  );

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:flex-row sm:items-start sm:gap-8 sm:px-6">
      {/* 2×2 artwork grid */}
      <div className="grid shrink-0 grid-cols-2 gap-1 rounded-xl overflow-hidden size-24 sm:size-32">
        {artworkSlots.map((item, i) => (
          <ArtworkCell key={i} item={item} index={i} />
        ))}
      </div>

      {/* Meta */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Title */}
        <InlineText
          value={list?.title}
          onSave={handleTitleSave}
          maxLength={60}
          placeholder="Untitled list"
          readOnly={readOnly}
          className="text-xl font-bold leading-tight tracking-tight"
        />

        {/* Description */}
        <InlineText
          value={list?.description}
          onSave={handleDescriptionSave}
          maxLength={200}
          placeholder="Add a description..."
          readOnly={readOnly}
          multiline
          className="text-sm text-muted-foreground"
        />

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? "show" : "shows"}
          </span>

          {/* Privacy badge */}
          <button
            onClick={() => !readOnly && onShareToggle?.()}
            disabled={readOnly}
            className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none"
          >
            {list?.is_shared ? (
              <>
                <Link2Icon className="size-3" />
                Shared
              </>
            ) : (
              <>
                <LockIcon className="size-3" />
                Private
              </>
            )}
          </button>
        </div>

        {/* Actions row */}
        {!readOnly && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => router.push("/charts/apple/us/top")}
              className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-80"
            >
              <PlusIcon className="size-3.5" />
              Add podcasts
            </button>

            {/* Export dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((v) => !v)}
                onBlur={(e) => {
                  if (!exportRef.current?.contains(e.relatedTarget)) {
                    setExportOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Export
                <ChevronDownIcon className="size-3" />
              </button>

              {exportOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-popover shadow-md">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      exportCsv(list);
                      setExportOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-muted rounded-t-lg"
                  >
                    Export as CSV
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      exportJson(list);
                      setExportOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-muted rounded-b-lg"
                  >
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
