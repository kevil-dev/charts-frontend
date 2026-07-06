"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LockIcon,
  Link2Icon,
  PlusIcon,
  DownloadIcon,
  ChevronDownIcon,
  Share2Icon,
  XIcon,
  Loader2Icon,
  CheckIcon,
  CopyIcon,
  PencilIcon,
} from "lucide-react";
import { toast } from "sonner";
import listsApi from "@/features/lists/services/listsApi";
import EmailExportModal from "./EmailExportModal";

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

function ArtworkCell({ item }) {
  return (
    <div className="w-full h-full overflow-hidden bg-muted">
      {item ? (
        <img
          src={item.artwork_url}
          alt={item.podcast_name}
          className="w-full h-full object-cover transition-opacity hover:opacity-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted/20 backdrop-blur-sm">
          <Link2Icon className="size-8 text-muted-foreground/30" />
        </div>
      )}
    </div>
  );
}

// ── Share modal ───────────────────────────────────────────────────────────────

function ShareModal({ list, onClose, onShareChange }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareToken = list?.share_token ?? null;
  const shareUrl = shareToken
    ? `${window.location.origin}/lists/shared/${shareToken}`
    : null;

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  async function handleCreate() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await listsApi.share(list.id);
      onShareChange(res.share_token);
    } catch {
      toast.error("Couldn't create share link");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (loading) return;
    setLoading(true);
    try {
      await listsApi.revokeShare(list.id);
      const res = await listsApi.share(list.id);
      onShareChange(res.share_token);
      toast.success("New share link generated");
    } catch {
      toast.error("Couldn't regenerate link");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">Share this list</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Anyone with the link can view this list.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* State A — no link yet */}
        {!shareToken ? (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading && <Loader2Icon className="size-4 animate-spin" />}
            {loading ? "Creating…" : "Create share link"}
          </button>
        ) : (
          /* State B — link exists */
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
              >
                {copied ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              {loading && <Loader2Icon className="size-3.5 animate-spin" />}
              Revoke & generate new link
            </button>
          </div>
        )}
      </div>
    </div>
  );
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
      <div className="mb-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 60))}
          onBlur={commit}
          onKeyDown={onKeyDown}
          maxLength={60}
          className="text-4xl md:text-6xl font-extrabold tracking-tight bg-transparent border-b-2 border-[var(--brand-indigo)] outline-none w-full text-foreground"
        />
        <span className="text-xs text-[var(--brand-indigo)] mt-1 inline-block font-mono">{draft.length}/60</span>
      </div>
    );
  }

  return (
    <div className={readOnly ? "mb-2" : "group flex items-center gap-3 mb-2"}>
      <span
        onClick={startEdit}
        role={readOnly ? undefined : "button"}
        tabIndex={readOnly ? undefined : 0}
        onKeyDown={(e) => e.key === "Enter" && startEdit()}
        className={`text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-[1.1] block ${
          readOnly ? "" : "cursor-text hover:opacity-80 transition-opacity"
        }`}
      >
        {value || <span className="text-muted-foreground/40 font-bold">Untitled List</span>}
      </span>
      {!readOnly && (
        <button
          onClick={startEdit}
          aria-label="Edit title"
          className="shrink-0 rounded-full p-2 bg-muted/50 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
        >
          <PencilIcon className="size-4" />
        </button>
      )}
    </div>
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
    <div className={readOnly ? "" : "group flex items-start gap-1.5"}>
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
      {!readOnly && (
        <button
          onClick={startEdit}
          aria-label="Edit description"
          className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <PencilIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ListHeader({
  list,
  onUpdate,
  onShareChange,
  readOnly = false,
}) {
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
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
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-muted/50 to-background border border-border/50 p-6 md:p-10 mb-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8">
          
          {/* 2×2 artwork grid */}
          <div className="grid grid-cols-2 gap-0.5 w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shrink-0 shadow-2xl shadow-black/50 border border-white/10 bg-muted">
            {artworkSlots.map((item, i) => (
              <ArtworkCell key={i} item={item} />
            ))}
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-2 min-w-0 flex-1 pt-2 w-full text-center md:text-left">
            
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

            {/* Stats + privacy pill + share button */}
            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground font-medium">
              <span className="text-foreground">{itemCount} {itemCount === 1 ? "podcast" : "podcasts"}</span>
              <span aria-hidden="true" className="opacity-50">•</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/50 px-3 py-1 text-xs backdrop-blur-md">
                {list?.share_token ? (
                  <><Link2Icon className="size-3.5 text-[var(--brand-indigo)]" />Shared</>
                ) : (
                  <><LockIcon className="size-3.5" />Private</>
                )}
              </span>
              {!readOnly && (
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="rounded-full bg-[var(--brand-indigo)]/10 text-[var(--brand-indigo)] p-2 hover:bg-[var(--brand-indigo)] hover:text-white transition-colors"
                  aria-label="Share list"
                >
                  <Share2Icon className="size-4" />
                </button>
              )}
            </div>

            {/* Action buttons — hidden in readOnly mode */}
            {!readOnly && (
              <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
                <button
                  onClick={() => router.push("/charts/apple/us/top")}
                  className="rounded-full bg-foreground text-background text-sm font-bold px-8 py-3 hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-black/20"
                >
                  <PlusIcon className="size-5" />
                  Add to List
                </button>

                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setExportOpen((v) => !v)}
                    onBlur={(e) => {
                      if (!exportRef.current?.contains(e.relatedTarget)) {
                        setExportOpen(false);
                      }
                    }}
                    className="rounded-full border-2 border-border text-sm font-bold px-6 py-2.5 hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <DownloadIcon className="size-4" />
                    Export
                    <ChevronDownIcon className="size-4 opacity-50" />
                  </button>

                  {exportOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          exportCsv(list);
                          setExportOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <span className="font-mono text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded text-muted-foreground">CSV</span>
                        Export Data
                      </button>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          exportJson(list);
                          setExportOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-muted transition-colors border-t border-border flex items-center gap-2"
                      >
                        <span className="font-mono text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded text-muted-foreground">JSON</span>
                        Export Data
                      </button>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setEmailModalOpen(true);
                          setExportOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-muted transition-colors border-t border-border text-[var(--brand-indigo)]"
                      >
                        Email Export
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share modal */}
      {shareModalOpen && (
        <ShareModal
          list={list}
          onClose={() => setShareModalOpen(false)}
          onShareChange={onShareChange}
        />
      )}

      {/* Email Export modal */}
      {emailModalOpen && (
        <EmailExportModal
          list={list}
          onClose={() => setEmailModalOpen(false)}
        />
      )}
    </>
  );
}
