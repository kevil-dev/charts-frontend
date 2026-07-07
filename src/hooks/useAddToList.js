"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import listsApi from "@/services/listsApi";
import { useListsCache } from "@/providers/ListsCacheContext";

export function useAddToList() {
  const router = useRouter();
  const { lists, ensureLoaded, addList, updateList } = useListsCache();
  const [loading, setLoading] = useState(false);

  const ensureListsLoaded = useCallback(async () => {
    setLoading(true);
    await ensureLoaded();
    setLoading(false);
  }, [ensureLoaded]);

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
      
      updateList(listId, (list) => {
        const newItem = { artwork_url: row.artwork ?? null, podcast_name: row.name };
        return {
          ...list,
          item_count: (list.item_count || 0) + 1,
          items: [newItem, ...(list.items || [])].slice(0, 4)
        };
      });

      toast.success(`Added to "${listTitle}"`, {
        action: {
          label: "View list",
          onClick: () => router.push(`/lists/${listId}`),
        },
        duration: 5000,
      });
      return true;
    } catch (err) {
      if (err.message?.includes("Already")) {
        toast.error(`Already in "${listTitle}"`);
      } else {
        toast.error("Couldn't add to list");
      }
      return false;
    }
  }, [router]);

  const createList = useCallback(async (title) => {
    const res = await listsApi.create(title);
    const newList = res.list ?? null;
    if (!newList) throw new Error("Failed to create list");
    addList(newList);
    return newList;
  }, [addList]);

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
        if (err.message?.includes("Already")) duplicates++;
      }
    }

    if (successes > 0) {
      updateList(listId, (list) => {
        const newItems = rows.map(r => ({ artwork_url: r.artwork ?? null, podcast_name: r.name }));
        return {
          ...list,
          item_count: (list.item_count || 0) + successes,
          items: [...newItems, ...(list.items || [])].slice(0, 4)
        };
      });
    }

    let message = `Added ${successes} to "${listTitle}"`;
    if (duplicates > 0) message += ` · ${duplicates} already there`;
    toast.success(message, {
      action: {
        label: "View list",
        onClick: () => router.push(`/lists/${listId}`),
      },
      duration: 5000,
    });
    return { successes, duplicates };
  }, [router]);

  return { lists, loading, ensureLoaded: ensureListsLoaded, addPodcastToList, createList, createListAndAdd, addManyToList };
}
