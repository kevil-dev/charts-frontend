"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useListDetail } from "@/features/lists/hooks/useListDetail";
import listsApi from "@/features/lists/services/listsApi";
import ListHeader from "./ListHeader";
import ListRow from "./ListRow";
import { showDeleteToast } from "./DeleteToast";

function SkeletonHeader() {
  return (
    <div className="flex gap-6 px-4 py-6 sm:gap-8 sm:px-6 animate-pulse">
      <div className="size-24 sm:size-32 rounded-xl bg-muted/60 shrink-0" />
      <div className="flex flex-1 flex-col gap-3 pt-1">
        <div className="h-6 w-48 rounded bg-muted/60" />
        <div className="h-4 w-72 rounded bg-muted/60" />
        <div className="h-3 w-24 rounded bg-muted/60 mt-1" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border animate-pulse">
      <div className="size-10 rounded-lg bg-muted/60 shrink-0" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3.5 w-40 rounded bg-muted/60" />
        <div className="h-3 w-28 rounded bg-muted/60" />
      </div>
    </div>
  );
}

export default function ListPage({ listId }) {
  const { list, loading, removeItem, restoreItem, commitRemoveItem, updateMeta } =
    useListDetail(listId);

  const handleUpdate = useCallback(
    async (fields) => {
      if (!list) return;
      updateMeta(fields);
      try {
        await listsApi.update(list.id, fields);
      } catch {
        updateMeta({ title: list.title, description: list.description });
      }
    },
    [list, updateMeta]
  );

  const handleShareToggle = useCallback(async () => {
    if (!list) return;
    try {
      if (list.is_shared) {
        await listsApi.revokeShare(list.id);
        updateMeta({ is_shared: false });
      } else {
        await listsApi.share(list.id);
        updateMeta({ is_shared: true });
      }
    } catch {
      // revert silently — state unchanged
    }
  }, [list, updateMeta]);

  const handleDelete = useCallback(
    (item) => {
      if (!list) return;
      removeItem(item.id);
      const timeoutId = setTimeout(() => {
        commitRemoveItem(list.id, item.id);
      }, 5000);
      showDeleteToast(item, () => {
        clearTimeout(timeoutId);
        restoreItem(item);
      });
    },
    [list, removeItem, restoreItem, commitRemoveItem]
  );

  if (loading) {
    return (
      <div>
        <SkeletonHeader />
        <div className="border-t border-border">
          {[...Array(6)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">List not found.</p>
      </div>
    );
  }

  const items = list.items ?? [];

  return (
    <div>
      <ListHeader
        list={list}
        onUpdate={handleUpdate}
        onShareToggle={handleShareToggle}
      />

      <div className="border-t border-border">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base font-medium text-foreground">No podcasts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Go to{" "}
              <Link
                href="/charts/apple/us/top"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Charts
              </Link>{" "}
              to add some
            </p>
          </div>
        ) : (
          items.map((item) => (
            <ListRow key={item.id} item={item} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
