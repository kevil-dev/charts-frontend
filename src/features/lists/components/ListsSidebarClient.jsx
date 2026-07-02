"use client";

import { useRouter } from "next/navigation";
import { useLists } from "@/features/lists/hooks/useLists";
import ListSidebar from "@/features/lists/components/ListSidebar";

export default function ListsSidebarClient({ initialLists, currentListId }) {
  const { lists, createList, deleteList } = useLists(initialLists);
  const router = useRouter();

  async function handleCreateList(title) {
    const newList = await createList(title);
    router.push(`/lists/${newList.id}`);
  }

  async function handleDeleteList(list) {
    await deleteList(list.id);
    const remaining = lists.filter((l) => l.id !== list.id);
    router.push(remaining.length > 0 ? `/lists/${remaining[0].id}` : "/lists");
  }

  return (
    <ListSidebar
      lists={lists}
      currentListId={currentListId}
      onCreateList={handleCreateList}
      onDeleteList={handleDeleteList}
    />
  );
}
