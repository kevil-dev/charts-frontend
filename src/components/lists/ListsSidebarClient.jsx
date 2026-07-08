"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  useGetListsQuery,
  useCreateListMutation,
  useDeleteListMutation,
} from "@/services/listsApiSlice";
import ListSidebar from "@/components/lists/ListSidebar";

export default function ListsSidebarClient() {
  const router = useRouter();
  const params = useParams();
  const activeListId = params?.id ? decodeURIComponent(params.id) : null;

  const { data } = useGetListsQuery();
  const lists = useMemo(() => data?.lists ?? [], [data]);
  const [createList] = useCreateListMutation();
  const [deleteList] = useDeleteListMutation();

  const handleCreateList = useCallback(async (title) => {
    try {
      const res = await createList({ title, description: null }).unwrap();
      const newList = res?.list ?? null;
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
      await deleteList(list.id).unwrap();
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
      currentListId={activeListId}
      onCreateList={handleCreateList}
      onDeleteList={handleDeleteList}
    />
  );
}
