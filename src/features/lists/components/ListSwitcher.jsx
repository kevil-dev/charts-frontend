"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, CheckIcon, ChevronDownIcon } from "lucide-react";

export default function ListSwitcher({ lists = [], currentListId, onCreateList }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const currentList = lists.find((l) => l.id === currentListId);
  const visible = lists.slice(0, 50);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleCreate(e) {
    e?.preventDefault();
    const title = newTitle.trim();
    if (!title || creating) return;
    try {
      setCreating(true);
      const newList = await onCreateList(title);
      setNewTitle("");
      setOpen(false);
      if (newList?.id) router.push(`/lists/${newList.id}`);
    } finally {
      setCreating(false);
    }
  }

  function handleInputKeyDown(e) {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") {
      setNewTitle("");
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          List
        </span>
        <span className="max-w-[140px] truncate text-foreground">
          {currentList?.title ?? "Select list"}
        </span>
        <ChevronDownIcon className="size-3 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover shadow-lg">
          <div className="max-h-64 overflow-y-auto py-1">
            {visible.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No lists yet</p>
            )}
            {visible.map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  router.push(`/lists/${list.id}`);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  list.id === currentListId ? "font-medium text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {list.id === currentListId && (
                  <CheckIcon className="size-3.5 shrink-0 text-primary" />
                )}
                <span
                  className={`truncate ${list.id === currentListId ? "" : "pl-5"}`}
                >
                  {list.title}
                </span>
              </button>
            ))}
          </div>

          {/* New list input */}
          <div className="border-t border-border p-2">
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="New list name..."
                maxLength={80}
                className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
              />
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || creating}
                aria-label="Create list"
                className="flex size-7 items-center justify-center rounded-md bg-foreground text-background transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                <PlusIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
