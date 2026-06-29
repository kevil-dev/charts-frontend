"use client";

import { useLists } from "@/features/lists/hooks/useLists";
import ListSwitcher from "@/features/lists/components/ListSwitcher";

export default function ListsShell({ initialLists, currentListId }) {
  const { lists, createList } = useLists();
  // Use live hook data once loaded; fall back to server-fetched initial lists
  const displayLists = lists.length > 0 ? lists : initialLists;

  return (
    <ListSwitcher
      lists={displayLists}
      currentListId={currentListId}
      onCreateList={createList}
    />
  );
}
