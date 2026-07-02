import { cookies } from "next/headers";
import ListsSidebarClient from "@/features/lists/components/ListsSidebarClient";
import ListPage from "@/features/lists/components/ListPage";

async function fetchAllLists() {
  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/lists`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
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
    <div className="flex h-[calc(100vh-var(--navbar-height))] overflow-hidden">
      <div className="w-72 shrink-0 border-r border-border overflow-y-auto px-3 py-4">
        <ListsSidebarClient initialLists={lists} currentListId={id} />
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <ListPage listId={id} />
      </div>
    </div>
  );
}
