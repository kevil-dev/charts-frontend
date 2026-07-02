"use client";

import { useCallback } from "react";
import { useListsCache } from "@/features/lists/context/ListsCacheContext";
import listsApi from "@/features/lists/services/listsApi";

export function useLists() {
  const { lists, addList, removeList } = useListsCache();

  const createList = useCallback(async (title, description = null) => {
    try {
      const res = await listsApi.create(title, description);
      const newList = res.list ?? null;
      if (!newList) throw new Error("Failed to create list");
      addList(newList);
      return newList;
    } catch (err) {
      if (err?.status === 403 || err?.message?.toLowerCase().includes("limit")) {
        const limitErr = new Error("List limit reached");
        limitErr.code = "LIMIT_EXCEEDED";
        throw limitErr;
      }
      throw err;
    }
  }, [addList]);

  const deleteList = useCallback(async (id) => {
    await listsApi.destroy(id);
    removeList(id);
  }, [removeList]);

  return { lists, createList, deleteList };
}
