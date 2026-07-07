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
    <div className="px-6 py-8 animate-pulse">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="shrink-0 rounded-xl bg-muted/60" style={{ width: 128, height: 128 }} />
        <div className="flex flex-1 flex-col gap-3 pt-1">
          <div className="h-10 w-56 rounded-md bg-muted/60" />
          <div className="h-4 w-72 rounded bg-muted/60" />
          <div className="h-3 w-28 rounded bg-muted/60 mt-1" />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 animate-pulse">
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

  const handleShareChange = useCallback((shareToken) => {
    updateMeta({ share_token: shareToken, is_shared: !!shareToken, is_private: shareToken ? 0 : 1 });
  }, [updateMeta]);

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
        <div className="mx-6 mb-6 rounded-xl border border-border bg-card overflow-hidden">
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
    <>
      <ListHeader
        list={list}
        onUpdate={handleUpdate}
        onShareChange={handleShareChange}
      />

      <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base font-medium text-foreground">No podcasts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Go to{" "}
              <Link href="/charts/apple/us/top" className="underline underline-offset-4 hover:text-foreground transition-colors">
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
    </>
  );
}
