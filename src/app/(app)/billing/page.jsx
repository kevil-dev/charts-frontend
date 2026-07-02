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
    <div className="relative min-h-screen">
      {/* Background mesh — consistent with lists page */}
      <div className="refined-mesh-full" aria-hidden="true" />
      <div className="hero-mesh" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-16 pb-12">
        {/* Page heading */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
          Billing.
        </h1>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <BillingSettings />
        </HydrationBoundary>
      </div>
    </div>
  );
}
