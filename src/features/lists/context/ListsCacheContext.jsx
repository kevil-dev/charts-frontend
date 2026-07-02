"use client";

import { createContext, useContext, useState, useCallback } from "react";
import listsApi from "@/features/lists/services/listsApi";

const ListsCacheContext = createContext(null);

export function ListsCacheProvider({ children, initialLists = [] }) {
  const [lists, setLists] = useState(initialLists);
  const [loaded, setLoaded] = useState(initialLists.length > 0);

  const ensureLoaded = useCallback(async () => {
    if (loaded) return;
    try {
      const res = await listsApi.getAll();
      setLists(res.lists ?? []);
      setLoaded(true);
    } catch {
      // silently fail — consumers handle empty state
    }
  }, [loaded]);

  const addList = useCallback((newList) => {
    setLists((prev) => [newList, ...prev]);
  }, []);

  const removeList = useCallback((id) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const invalidate = useCallback(() => {
    setLoaded(false);
    setLists([]);
  }, []);

  return (
    <ListsCacheContext.Provider
      value={{ lists, loaded, ensureLoaded, addList, removeList, invalidate }}
    >
      {children}
    </ListsCacheContext.Provider>
  );
}

export function useListsCache() {
  const ctx = useContext(ListsCacheContext);
  if (!ctx) throw new Error("useListsCache must be used within ListsCacheProvider");
  return ctx;
}
