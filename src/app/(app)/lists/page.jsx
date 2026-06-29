import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreateFirstList from "../../../features/lists/components/CreateFirstList";

async function fetchLists() {
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

export default async function ListsPage() {
  const lists = await fetchLists();

  if (lists.length > 0) {
    redirect(`/lists/${lists[0].id}`);
  }

  return (
    <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center px-4">
      <CreateFirstList />
    </div>
  );
}