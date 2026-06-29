"use client";

import { useLists } from "@/features/lists/hooks/useLists";
import { useListDetail } from "@/features/lists/hooks/useListDetail";
import ListSwitcher from "@/features/lists/components/ListSwitcher";

export default function ListsShell({ initialLists, currentListId }) {
  const { lists, createList } = useLists(initialLists);
  const { list: currentList } = useListDetail(currentListId);

  return (
    <ListSwitcher
      lists={lists}
      currentListId={currentListId}
      currentList={currentList}
      onCreateList={createList}
    />
  );
}
