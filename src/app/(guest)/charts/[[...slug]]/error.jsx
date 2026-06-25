"use client";

import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center">
      <AlertCircleIcon className="size-8 text-destructive" />
      <p className="text-sm font-medium text-destructive">
        Something went wrong loading the chart.
      </p>
      <button
        onClick={() => reset()} // Next.js gives you this automatically!
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <RefreshCwIcon className="size-3" />
        Try again
      </button>
    </div>
  );
}