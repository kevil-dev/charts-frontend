"use client";

import { useState, useRef, useEffect } from "react";
import { PlusIcon, Loader2Icon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useAddToList } from "@/features/lists/hooks/useAddToList";

export default function AddToListDropdown({ rows, platform, open, onClose, anchorClassName }) {
  const { user } = useAuth();
  const isGuest = !user;
  const pathname = usePathname();
  const router = useRouter();
  const { lists, loading, ensureLoaded, addPodcastToList, createList, createListAndAdd, addManyToList } =
    useAddToList();
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingListId, setPendingListId] = useState(null);
  const busy = pendingListId !== null || creating;
  const containerRef = useRef(null);

  useEffect(() => {
    if (open && !isGuest) ensureLoaded();
  }, [open, isGuest, ensureLoaded]);

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e) {
      if (!containerRef.current?.contains(e.target)) onClose();
    }
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  async function handleSelect(list) {
    if (busy) return;
    setPendingListId(list.id);
    try {
      if (rows.length === 1) {
        await addPodcastToList(list.id, list.title, rows[0], platform);
      } else {
        await addManyToList(list.id, list.title, rows, platform);
      }
      onClose();
    } finally {
      setPendingListId(null);
    }
  }

  async function handleCreate(e) {
    e?.preventDefault();
    const title = newTitle.trim();
    if (!title || creating) return;
    try {
      setCreating(true);
      if (rows.length === 1) {
        await createListAndAdd(title, rows[0], platform);
      } else {
        const newList = await createList(title);
        await addManyToList(newList.id, newList.title, rows, platform);
      }
      setNewTitle("");
      onClose();
    } catch (err) {
      if (err?.code === "LIMIT_EXCEEDED" || err?.status === 403 ||
          err?.message?.toLowerCase().includes("limit")) {
        toast.error("List limit reached — upgrade to create more.", {
          action: {
            label: "Upgrade",
            onClick: () => router.push("/pricing"),
          },
          duration: 6000,
        });
      } else {
        toast.error(err?.message ?? "Failed to create list");
      }
    } finally {
      setCreating(false);
    }
  }

  function handleInputKeyDown(e) {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") {
      setNewTitle("");
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className={
        anchorClassName ??
        "absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover shadow-lg"
      }
    >
      {isGuest ? (
        <div className="flex flex-col items-center gap-2 px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">
            Sign in to add podcasts to lists
          </p>
          <Link
            href={`/login?from=${pathname}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
          >
            Sign in <ArrowRightIcon className="size-3" />
          </Link>
        </div>
      ) : (
        <>
          <div className="max-h-64 overflow-y-auto py-1">
            {loading && lists.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Loading…</p>
            ) : lists.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No lists yet</p>
            ) : (
              lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleSelect(list)}
                  disabled={busy}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-default"
                >
                  <span className="flex size-3.5 shrink-0 items-center justify-center">
                    {pendingListId === list.id && (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    )}
                  </span>
                  <span className="truncate">{list.title}</span>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border p-2">
            <div className="flex items-center gap-1.5">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={busy}
                placeholder="New list name…"
                maxLength={80}
                className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 disabled:opacity-50"
              />
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || busy}
                aria-label="Create list"
                className="flex size-7 items-center justify-center rounded-md bg-foreground text-background transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {creating ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <PlusIcon className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
