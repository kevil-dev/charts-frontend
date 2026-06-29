export function PodiumSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-background p-5.5 flex flex-col">
      <div className="flex items-start gap-4.5">
        <div className="size-14 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-8 rounded bg-muted" />
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-px my-5 bg-muted" />
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <div className="size-4 rounded bg-muted" />
          <div className="size-4 rounded bg-muted" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="w-10 pl-4 pr-2 py-3">
        <div className="size-4 rounded bg-muted" />
      </td>
      <td className="w-10 pr-3 py-3">
        <div className="h-4 w-6 rounded bg-muted ml-auto" />
      </td>
      <td className="py-3 pr-4">
        <div className="size-10 rounded-lg bg-muted" />
      </td>
      <td className="py-3 pr-6 min-w-0">
        <div className="h-4 w-48 rounded bg-muted mb-1.5" />
        <div className="h-3 w-32 rounded bg-muted" />
      </td>
      <td className="py-3 pr-6">
        <div className="size-4 rounded bg-muted" />
      </td>
      <td className="py-3 pr-4">
        <div className="h-6 w-16 rounded bg-muted ml-auto" />
      </td>
    </tr>
  );
}