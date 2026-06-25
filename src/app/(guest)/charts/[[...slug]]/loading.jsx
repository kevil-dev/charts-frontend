export default function ChartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-3 w-3 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-3 w-3 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      {/* Live badge skeleton */}
      <div className="h-6 w-40 rounded-full bg-muted mb-6" />
      {/* Title skeleton */}
      <div className="h-12 w-72 rounded bg-muted mb-3" />
      <div className="h-5 w-96 rounded bg-muted mb-6" />
      {/* Filter bar skeleton */}
      <div className="h-12 w-full rounded-xl bg-muted mb-10" />
      {/* Podium skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded-xl border border-border bg-background p-6 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="size-14 rounded-full bg-muted" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-8 rounded bg-muted" />
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
            <div className="h-px bg-muted" />
            <div className="flex justify-between">
              <div className="flex gap-1">
                <div className="size-4 rounded bg-muted" />
                <div className="size-4 rounded bg-muted" />
              </div>
              <div className="h-9 w-24 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-border overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="size-4 rounded bg-muted" />
            <div className="w-6 h-4 rounded bg-muted ml-2" />
            <div className="size-10 rounded-lg bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </div>
            <div className="size-4 rounded bg-muted" />
            <div className="h-6 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
