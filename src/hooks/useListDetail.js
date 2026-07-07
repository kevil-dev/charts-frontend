"use client";

import { useState, useEffect, useCallback } from "react";
import listsApi from "@/services/listsApi";

export function useListDetail(id) {
  const [list, setList]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchList = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await listsApi.getOne(id);
      setList(res.list);
    } catch (err) {
        console.error("useListDetail fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Optimistic item removal — removes instantly, restores on undo
  const removeItem = useCallback((itemId) => {
    setList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      };
    });
  }, []);

  // Restore an item (called when undo is clicked before toast expires)
  const restoreItem = useCallback((item) => {
    setList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [...prev.items, item].sort(
          (a, b) => new Date(a.added_at) - new Date(b.added_at)
        ),
      };
    });
  }, []);

  // Commit the delete to the server (called when toast expires)
  const commitRemoveItem = useCallback(async (listId, itemId) => {
    try {
      await listsApi.removeItem(listId, itemId);
    } catch {
      // If server delete fails, refetch to restore true state
      fetchList();
    }
  }, [fetchList]);

  const updateMeta = useCallback((fields) => {
    setList((prev) => prev ? { ...prev, ...fields } : prev);
  }, []);

  const addItem = useCallback(async (listId, itemData) => {
    const res = await listsApi.addItem(listId, itemData);
    const newItem = res.item;
    setList((prev) => {
      if (!prev) return prev;
      return { ...prev, items: [...prev.items, newItem] };
    });
    return newItem;
  }, []);

  return {
    list,
    loading,
    error,
    removeItem,
    restoreItem,
    commitRemoveItem,
    updateMeta,
    addItem,
    refetch: fetchList,
  };
}