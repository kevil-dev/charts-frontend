"use client";

import { useState, useEffect, useCallback } from "react";
import listsApi from "@/features/lists/services/listsApi";

export function useLists(initialData = []) {
  const [lists, setLists] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listsApi.getAll();
      setLists(res.lists ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = useCallback(async (title, description = null) => {
    const res = await listsApi.create(title, description);
    const newList = res.list ?? null;
    if (!newList) throw new Error("Failed to create list");
    setLists((prev) => [newList, ...prev]);
    return newList;
  }, []);

  const deleteList = useCallback(async (id) => {
    await listsApi.destroy(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { lists, loading, error, createList, deleteList, refetch: fetchLists };
}
