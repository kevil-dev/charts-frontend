import Link from "next/link";
import ListHeader from "@/components/lists/ListHeader";
import ListRow from "@/components/lists/ListRow";

async function fetchSharedList(token) {
  try {
    const res = await fetch(
      `${process.env.INTERNAL_API_URL}/lists/shared/${token}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.list ?? null;
  } catch {
    return null;
  }
}

export default async function SharedListPage({ params }) {
  const { token } = await params;
  const list = await fetchSharedList(token);

  if (!list) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">
            This list is not available
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been made private or deleted.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-foreground transition-colors text-muted-foreground"
          >
            Go to Million Podcasts
          </Link>
        </div>
      </div>
    );
  }

  const items = list.items ?? [];

  return (
    <div className="mx-auto max-w-3xl px-0 sm:px-4 py-6">
      {/* Sticky sign-in CTA */}
      <div className="sticky top-[var(--navbar-height)] z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:rounded-xl sm:border sm:mb-4">
        <p className="text-sm text-muted-foreground">
          Sign in to Million to save podcasts to your own lists
        </p>
        <Link
          href="/login"
          className="shrink-0 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-80"
        >
          Sign in
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <ListHeader list={list} readOnly={true} />
        <div className="border-t border-border">
          {items.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              This list has no podcasts yet.
            </div>
          ) : (
            items.map((item) => (
              <ListRow key={item.id} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
