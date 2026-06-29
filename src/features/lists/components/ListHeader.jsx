"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LockIcon,
  Link2Icon,
  PlusIcon,
  DownloadIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Artwork } from "@/features/charts/components/ChartRow";

// ── Export helpers ────────────────────────────────────────────────────────────

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
  downloadFile(
    `${list.title ?? "list"}.csv`,
    rows.map((r) => r.join(",")).join("\n"),
    "text/csv"
  );
}

function exportJson(list) {
  downloadFile(
    `${list.title ?? "list"}.json`,
    JSON.stringify(list.items ?? [], null, 2),
    "application/json"
  );
}

// ── Artwork grid cell ─────────────────────────────────────────────────────────

function ArtworkCell({ item, index }) {
  if (!item) return <div className="size-16 bg-muted" />;
  return <Artwork src={item.artwork_url} name={item.podcast_name} size={16} square rank={index + 1} />;
}

// ── Inline title ──────────────────────────────────────────────────────────────

function InlineTitle({ value, onSave, readOnly }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  function startEdit() {
    if (readOnly) return;
    setDraft(value ?? "");
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== (value ?? "")) onSave(trimmed);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setEditing(false); setDraft(value ?? ""); }
  }

  if (editing) {
    return (
      <div>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 60))}
          onBlur={commit}
          onKeyDown={onKeyDown}
          maxLength={60}
          className="text-4xl font-bold tracking-tight bg-transparent border-b border-border outline-none w-full"
        />
        <span className="text-xs text-muted-foreground">{draft.length}/60</span>
      </div>
    );
  }

  return (
    <span
      onClick={startEdit}
      role={readOnly ? undefined : "button"}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={(e) => e.key === "Enter" && startEdit()}
      className={`text-4xl font-bold tracking-tight text-foreground leading-tight block ${
        readOnly ? "" : "cursor-text hover:opacity-80 transition-opacity"
      }`}
    >
      {value || <span className="text-muted-foreground/50">Untitled list</span>}
    </span>
  );
}

// ── Inline description ────────────────────────────────────────────────────────

function InlineDescription({ value, onSave, readOnly }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  function startEdit() {
    if (readOnly) return;
    setDraft(value ?? "");
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== (value ?? "")) onSave(trimmed);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") { setEditing(false); setDraft(value ?? ""); }
  }

  if (editing) {
    return (
      <div>
        <textarea
          autoFocus
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 200))}
          onBlur={commit}
          onKeyDown={onKeyDown}
          maxLength={200}
          className="text-base bg-transparent border-b border-border outline-none w-full resize-none"
        />
        <span className="text-xs text-muted-foreground">{draft.length}/200</span>
      </div>
    );
  }

  return (
    <span
      onClick={startEdit}
      role={readOnly ? undefined : "button"}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={(e) => e.key === "Enter" && startEdit()}
      className={`text-base text-muted-foreground block ${
        readOnly ? "" : "cursor-text hover:opacity-80 transition-opacity"
      }`}
    >
      {value || (
        <span className="text-muted-foreground/40">
          {readOnly ? null : "Add a description…"}
        </span>
      )}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ListHeader({
  list,
  onUpdate,
  onShareToggle,
  readOnly = false,
}) {
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  const items = list?.items ?? [];
  const artworkSlots = [0, 1, 2, 3].map((i) => items[i] ?? null);
  const itemCount = items.length;

  const handleTitleSave = useCallback(
    (title) => { if (title) onUpdate?.({ title }); },
    [onUpdate]
  );
  const handleDescriptionSave = useCallback(
    (description) => onUpdate?.({ description }),
    [onUpdate]
  );

  return (
    <div className="relative overflow-hidden w-full">
      {/* Animated gradient mesh — identical to ChartHero */}
      <div className="hero-mesh" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 px-6 pt-8 pb-6">
        <div className="flex items-start gap-6">

          {/* 2×2 artwork grid */}
          <div className="grid grid-cols-2 gap-0.5 size-32 rounded-xl overflow-hidden shrink-0">
            {artworkSlots.map((item, i) => (
              <ArtworkCell key={i} item={item} index={i} />
            ))}
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1 min-w-0 flex-1 pt-1">
            <InlineTitle
              value={list?.title}
              onSave={handleTitleSave}
              readOnly={readOnly}
            />

            <InlineDescription
              value={list?.description}
              onSave={handleDescriptionSave}
              readOnly={readOnly}
            />

            {/* Stats + privacy pill */}
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{itemCount} {itemCount === 1 ? "show" : "shows"}</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => !readOnly && onShareToggle?.()}
                disabled={readOnly}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs hover:bg-muted transition-colors disabled:pointer-events-none"
              >
                {list?.is_shared ? (
                  <><Link2Icon className="size-3" />Shared</>
                ) : (
                  <><LockIcon className="size-3" />Private</>
                )}
              </button>
            </div>

            {/* Action buttons — hidden in readOnly mode */}
            {!readOnly && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => router.push("/charts/apple/us/top")}
                  className="rounded-full bg-foreground text-background text-sm font-medium px-5 py-2 hover:opacity-80 transition-opacity flex items-center gap-1.5"
                >
                  <PlusIcon className="size-4" />
                  Add podcasts
                </button>

                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setExportOpen((v) => !v)}
                    onBlur={(e) => {
                      if (!exportRef.current?.contains(e.relatedTarget)) {
                        setExportOpen(false);
                      }
                    }}
                    className="rounded-full border border-border text-sm font-medium px-4 py-2 hover:bg-muted transition-colors flex items-center gap-1.5"
                  >
                    <DownloadIcon className="size-4" />
                    Export
                    <ChevronDownIcon className="size-3" />
                  </button>

                  {exportOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-popover shadow-md overflow-hidden">
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          exportCsv(list);
                          setExportOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                      >
                        Export as CSV
                      </button>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          exportJson(list);
                          setExportOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors border-t border-border"
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
      </div>
    </div>
  );
}
