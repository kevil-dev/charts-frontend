"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import listsApi from "@/features/lists/services/listsApi";

export default function CreateFirstList() {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e) {
    e?.preventDefault();
    const t = title.trim();
    if (!t || creating) return;
    try {
      setCreating(true);
      const res = await listsApi.create(t);
      const newList = res.list;
      if (newList?.id) router.push(`/lists/${newList.id}`);
    } catch (err) {
      setCreating(false);
      if (err?.code === "LIMIT_EXCEEDED") {
        router.push("/pricing");
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground">
        <PlusIcon className="size-10" strokeWidth={1.5} />
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your first list
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save podcasts you want to keep track of
        </p>
      </div>

      {showInput ? (
        <form onSubmit={handleCreate} className="flex w-72 flex-col gap-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setShowInput(false)}
            placeholder="List name..."
            maxLength={80}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            disabled={!title.trim() || creating}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {creating ? "Creating…" : "Create list"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          Create a list
        </button>
      )}
    </div>
  );
}
