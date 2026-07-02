"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLists } from "@/features/lists/hooks/useLists";
import ListSidebar from "@/features/lists/components/ListSidebar";

export default function ListsSidebarClient({ initialLists, currentListId }) {
  const router = useRouter();
  const { lists, createList, deleteList } = useLists(initialLists);

  const handleCreateList = useCallback(async (title) => {
    try {
      const newList = await createList(title);
      if (newList?.id) router.push(`/lists/${newList.id}`);
    } catch (err) {
      if (err?.code === "LIMIT_EXCEEDED") {
        toast.error("List limit reached — upgrade to create more.", {
          action: { label: "Upgrade", onClick: () => router.push("/pricing") },
          duration: 6000,
        });
      } else {
        toast.error(err?.message ?? "Failed to create list");
      }
    }
  }, [createList, router]);

  const handleDeleteList = useCallback(async (list) => {
    try {
      await deleteList(list.id);
      const remaining = lists.filter((l) => l.id !== list.id);
      if (remaining.length > 0) {
        router.push(`/lists/${remaining[0].id}`);
      } else {
        router.push("/lists");
      }
    } catch {
      toast.error("Failed to delete list");
    }
  }, [deleteList, lists, router]);

  return (
    <ListSidebar
      lists={lists}
      currentListId={currentListId}
      onCreateList={handleCreateList}
      onDeleteList={handleDeleteList}
    />
  );
}
