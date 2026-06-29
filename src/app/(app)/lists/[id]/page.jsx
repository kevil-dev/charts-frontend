import { cookies } from "next/headers";
import ListsShell from "@/features/lists/components/ListsShell";
import ListPage from "@/features/lists/components/ListPage";

async function fetchAllLists() {
  const cookieStore = await cookies();
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/lists`,
      {
        headers: { Cookie: cookieStore.toString() },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.lists ?? [];
  } catch {
    return [];
  }
}

export default async function ListDetailPage({ params }) {
  const { id } = await params;
  const lists = await fetchAllLists();

  return (
    <div className="mx-auto max-w-3xl px-0 sm:px-4 py-6">
      <div className="mb-4 px-4 sm:px-0">
        <ListsShell initialLists={lists} currentListId={id} />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <ListPage listId={id} />
      </div>
    </div>
  );
}
