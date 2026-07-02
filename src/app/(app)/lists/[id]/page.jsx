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
    <>
      <div className="refined-mesh-full" aria-hidden="true" />
      <div className="relative overflow-hidden">
        <div className="hero-mesh" aria-hidden="true" />
        <div className="relative z-10 flex h-[calc(100vh-var(--navbar-height))] overflow-hidden">
          {/* Left sidebar */}
          <aside className="w-72 shrink-0 border-r border-white/10 overflow-y-auto px-3 py-4 bg-[#0a0a0a]">
            <ListsSidebarClient initialLists={lists} currentListId={id} />
          </aside>

          {/* Right panel */}
          <main className="flex-1 overflow-y-auto px-6 pt-10 pb-6">
            <ListPage listId={id} />
          </main>
        </div>
      </div>
    </>
  );
}
