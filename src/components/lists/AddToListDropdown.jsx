"use client";

import { useState, useRef, useEffect } from "react";
import { PlusIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/authSlice";
import {
  useGetListsQuery,
  useCreateListMutation,
  useAddItemMutation,
} from "@/services/listsApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookmarkPlusIcon } from "lucide-react";

export default function AddToListDropdown({ rows, platform, open, onClose, anchorClassName }) {
  const user = useAppSelector(selectUser);
  const isGuest = !user;
  const pathname = usePathname();
  const router = useRouter();

  // skip: isGuest handles lazy loading — RTK Query fetches (once, deduped/cached
  // across every dropdown instance) when a signed-in user first mounts the hook.
  const { data, isLoading: loading } = useGetListsQuery(undefined, { skip: isGuest });
  const lists = data?.lists ?? [];
  const [createListMutation] = useCreateListMutation();
  const [addItem] = useAddItemMutation();

  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingListId, setPendingListId] = useState(null);
  const busy = pendingListId !== null || creating;
  const containerRef = useRef(null);

  async function addPodcastToList(listId, listTitle, row, platform) {
    try {
      await addItem({
        listId,
        podcast_name: row.name,
        podcast_author: row.artist_or_publisher ?? null,
        artwork_url: row.artwork ?? null,
        match_key: row.match_key ?? null,
        platform,
        genre: row.genre ?? null,
      }).unwrap();
      toast.success(`Added to "${listTitle}"`, {
        action: {
          label: "View list",
          onClick: () => router.push(`/lists/${listId}`),
        },
        duration: 5000,
      });
      return true;
    } catch (err) {
      if (err.message?.includes("Already")) {
        toast.error(`Already in "${listTitle}"`);
      } else {
        toast.error("Couldn't add to list");
      }
      return false;
    }
  }

  async function createList(title) {
    const res = await createListMutation({ title, description: null }).unwrap();
    const newList = res?.list ?? null;
    if (!newList) throw new Error("Failed to create list");
    return newList;
  }

  async function createListAndAdd(title, row, platform) {
    const newList = await createList(title);
    await addPodcastToList(newList.id, newList.title, row, platform);
    return newList;
  }

  async function addManyToList(listId, listTitle, rows, platform) {
    let successes = 0;
    let duplicates = 0;
    for (const row of rows) {
      try {
        await addItem({
          listId,
          podcast_name: row.name,
          podcast_author: row.artist_or_publisher ?? null,
          artwork_url: row.artwork ?? null,
          match_key: row.match_key ?? null,
          platform,
          genre: row.genre ?? null,
        }).unwrap();
        successes++;
      } catch (err) {
        if (err.message?.includes("Already")) duplicates++;
      }
    }

    let message = `Added ${successes} to "${listTitle}"`;
    if (duplicates > 0) message += ` · ${duplicates} already there`;
    toast.success(message, {
      action: {
        label: "View list",
        onClick: () => router.push(`/lists/${listId}`),
      },
      duration: 5000,
    });
    return { successes, duplicates };
  }

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

  if (isGuest) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-8 gap-6 rounded-3xl border-none shadow-2xl bg-background">
          <DialogHeader className="gap-2">
            <div className="mx-auto bg-[oklch(60%_0.25_280)]/10 text-[oklch(60%_0.25_280)] p-4 rounded-full w-fit mb-2">
              <BookmarkPlusIcon className="size-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold tracking-tight text-foreground">Save to your lists</DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground">
              Sign in to save your favorite podcasts, track your listening, and never lose a great show again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Link
              href={`/login?from=${pathname}`}
              className="flex items-center justify-center w-full rounded-full bg-[oklch(60%_0.25_280)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[oklch(55%_0.25_280)] hover:-translate-y-0.5"
            >
              Sign in or create account
            </Link>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-full rounded-full bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className={
        anchorClassName ??
        "absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover shadow-lg"
      }
    >
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
    </div>
  );
}
