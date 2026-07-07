"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, CheckIcon, SearchIcon, Loader2Icon } from "lucide-react";
import ListSidebarItem from "./ListSidebarItem";

export default function ListSidebar({ lists = [], currentListId, onCreateList, onDeleteList }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!confirmingId) return;
    const timer = setTimeout(() => setConfirmingId(null), 4000);
    return () => clearTimeout(timer);
  }, [confirmingId]);

  async function handleCreate() {
    const trimmed = newTitle.trim();
    console.log("handleCreate called", trimmed);
    if (!trimmed || creating) return;
    setCreating(true);
    try {
      await onCreateList(trimmed);
      setNewTitle("");
      setShowCreate(false);
    } catch {
      // errors are handled by onCreateList in ListsSidebarClient
    } finally {
      setCreating(false);
    }
  }

  function handleNewListKeyDown(e) {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") {
      setNewTitle("");
      setShowCreate(false);
    }
  }

  function handleDelete(list) {
    setConfirmingId(list.id);
  }

  async function handleConfirmDelete(list) {
    if (deleting) return;
    const idx = lists.findIndex((l) => l.id === list.id);
    try {
      setDeleting(true);
      await onDeleteList(list);
      setConfirmingId(null);
      if (list.id === currentListId) {
        const next = lists[idx + 1] ?? lists[idx - 1];
        router.push(next ? `/lists/${next.id}` : "/lists");
      }
    } finally {
      setDeleting(false);
    }
  }

  const filtered = lists.filter((l) =>
    l.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
      >
        <PlusIcon className="size-4" />
        New list
      </button>

      {showCreate && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleNewListKeyDown}
            placeholder="List name…"
            maxLength={60}
            autoFocus
            className="flex-1 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-white/25 placeholder:text-white/35"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newTitle.trim()}
            aria-label="Create list"
            className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-black transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {creating ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
          </button>
        </div>
      )}

      <div className="relative mt-2">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lists"
          className="w-full rounded-xl border border-white/15 bg-white/5 py-1.5 pl-8 pr-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-white/25 placeholder:text-white/35"
        />
      </div>

      <p className="mt-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white">
        Your lists
      </p>

      <div className="flex flex-col gap-0.5">
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-sm text-white/40">No lists found</p>
        )}
        {filtered.map((list) =>
          list.id === confirmingId ? (
            <div
              key={list.id}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5"
            >
              <span className="text-sm text-destructive">Delete list?</span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleConfirmDelete(list)}
                  disabled={deleting}
                  className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline disabled:opacity-50"
                >
                  {deleting && <Loader2Icon className="size-3 animate-spin" />}
                  Yes
                </button>
                <button
                  onClick={() => setConfirmingId(null)}
                  disabled={deleting}
                  className="text-xs font-medium text-white/50 hover:underline disabled:opacity-50"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <ListSidebarItem
              key={list.id}
              list={list}
              isActive={list.id === currentListId}
              onDelete={handleDelete}
            />
          )
        )}
      </div>
    </div>
  );
}
