"use client";

import { useCallback } from "react";
import Link from "next/link";
import {
  useGetListDetailQuery,
  useRemoveItemMutation,
  useUpdateListMetaMutation,
  listsApi,
} from "@/services/listsApiSlice";
import { useAppDispatch } from "@/store/hooks";
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
  const dispatch = useAppDispatch();
  // refetchOnMountOrArgChange: this list's data can be invalidated while this
  // page isn't mounted (e.g. adding items via the Charts page dropdown), and
  // RTK Query doesn't proactively refetch invalidated queries with no active
  // subscribers. Without this, navigating back here can show a stale snapshot
  // even though the sidebar (always-mounted useGetListsQuery) is up to date.
  const { data, isLoading: loading, refetch } = useGetListDetailQuery(listId, {
    refetchOnMountOrArgChange: true,
  });
  const list = data?.list ?? null;
  const [removeItem] = useRemoveItemMutation();
  const [updateListMeta] = useUpdateListMetaMutation();

  const handleUpdate = useCallback(
    async (fields) => {
      if (!list) return;
      try {
        // Must invalidate using listId (the same value passed to
        // useGetListDetailQuery / its providesTags), not list.id from the
        // response body — they can differ (route param is always a string;
        // the response field is typically a number), which misses the tag.
        await updateListMeta({ id: listId, ...fields }).unwrap();
      } catch {
        // invalidation refetches server truth on success; on failure the cache
        // is untouched, so the previous values remain shown
      }
    },
    [list, listId, updateListMeta]
  );

  const handleShareChange = useCallback(
    (shareToken) => {
      dispatch(
        listsApi.util.updateQueryData("getListDetail", listId, (draft) => {
          if (draft?.list) {
            draft.list.share_token = shareToken;
            draft.list.is_shared = !!shareToken;
            draft.list.is_private = shareToken ? 0 : 1;
          }
        })
      );
    },
    [dispatch, listId]
  );

  const handleDelete = useCallback(
    (item) => {
      if (!list) return;
      // 1. Optimistically remove from the cache immediately — no network yet.
      const patch = dispatch(
        listsApi.util.updateQueryData("getListDetail", listId, (draft) => {
          if (draft?.list?.items) {
            draft.list.items = draft.list.items.filter((i) => i.id !== item.id);
          }
        })
      );
      // 4. Commit the server delete only once the undo window closes.
      const timeoutId = setTimeout(() => {
        removeItem({ listId, itemId: item.id })
          .unwrap()
          .catch(() => refetch());
      }, 5000);
      // 2 + 3. Undo cancels the commit and restores the item — no mutation runs.
      showDeleteToast(item, () => {
        clearTimeout(timeoutId);
        patch.undo();
      });
    },
    [list, listId, dispatch, removeItem, refetch]
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
