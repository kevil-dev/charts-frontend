import { cookies } from "next/headers";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import BillingSettings from "@/features/billing/components/BillingSettings";

async function fetchBillingStatus() {
  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/billing/status`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export const metadata = { title: "Billing — Million Podcasts" };

export default async function BillingPage() {
  const status = await fetchBillingStatus();
  const queryClient = new QueryClient();
  if (status) {
    queryClient.setQueryData(["billing-status"], status);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BillingSettings />
      </HydrationBoundary>
    </div>
  );
}
