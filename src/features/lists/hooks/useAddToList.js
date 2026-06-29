"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import listsApi from "@/features/lists/services/listsApi";

let listsCache = null;
let cachePromise = null;

export function useAddToList() {
  const [lists, setLists] = useState(() => listsCache ?? []);
  const [loading, setLoading] = useState(false);

  const ensureLoaded = useCallback(async () => {
    if (listsCache !== null) {
      setLists(listsCache);
      return;
    }
    if (!cachePromise) {
      cachePromise = (async () => {
        try {
          const res = await listsApi.getAll();
          listsCache = res.lists ?? [];
        } catch {
          // leave listsCache null so next call retries
        } finally {
          cachePromise = null;
        }
      })();
    }
    setLoading(true);
    await cachePromise;
    setLists(listsCache ?? []);
    setLoading(false);
  }, []);

  const addPodcastToList = useCallback(async (listId, listTitle, row, platform) => {
    try {
      await listsApi.addItem(listId, {
        podcast_name:   row.name,
        podcast_author: row.artist_or_publisher ?? null,
        artwork_url:    row.artwork ?? null,
        match_key:      row.match_key ?? null,
        platform,
        genre:          row.genre ?? null,
      });
      toast.success(`Added to ${listTitle}`);
      return true;
    } catch (err) {
      if (err.message?.includes("Already")) {
        toast.error(`Already in ${listTitle}`);
      } else {
        toast.error("Couldn't add to list");
      }
      return false;
    }
  }, []);

  const createList = useCallback(async (title) => {
    const res = await listsApi.create(title);
    const newList = res.list ?? null;
    if (!newList) throw new Error("Failed to create list");
    listsCache = listsCache ? [newList, ...listsCache] : [newList];
    setLists((prev) => [newList, ...prev]);
    return newList;
  }, []);

  const createListAndAdd = useCallback(async (title, row, platform) => {
    const newList = await createList(title);
    await addPodcastToList(newList.id, newList.title, row, platform);
    return newList;
  }, [createList, addPodcastToList]);

  const addManyToList = useCallback(async (listId, listTitle, rows, platform) => {
    let successes = 0;
    let duplicates = 0;
    for (const row of rows) {
      try {
        await listsApi.addItem(listId, {
          podcast_name:   row.name,
          podcast_author: row.artist_or_publisher ?? null,
          artwork_url:    row.artwork ?? null,
          match_key:      row.match_key ?? null,
          platform,
          genre:          row.genre ?? null,
        });
        successes++;
      } catch (err) {
        if (err.message?.includes("Already")) {
          duplicates++;
        }
      }
    }
    let message = `Added ${successes} to ${listTitle}`;
    if (duplicates > 0) message += ` · ${duplicates} already there`;
    toast.success(message);
    return { successes, duplicates };
  }, []);

  return { lists, loading, ensureLoaded, addPodcastToList, createList, createListAndAdd, addManyToList };
}
