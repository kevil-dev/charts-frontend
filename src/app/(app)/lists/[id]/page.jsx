import { cookies } from "next/headers";
import ListsShell from "@/features/lists/components/ListsShell";
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
    <>
      <div className="mb-4">
        <ListsShell initialLists={lists} currentListId={id} />
      </div>
      <ListPage listId={id} />
    </>
  );
}
