"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import api from "@/lib/api";
import { billingApi } from "@/services/billingApiSlice";
import { useAppDispatch } from "@/store/hooks";
import { fetchUser } from "@/store/authSlice";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 20;
const PAID_STATUSES = ["trialing", "active"];

export default function ConfirmingSubscription() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    async function tick() {
      try {
        const status = await api.get("/billing/status");
        if (PAID_STATUSES.includes(status.plan_status)) {
          dispatch(billingApi.util.invalidateTags(["BillingStatus"]));
          await dispatch(fetchUser());
          if (!cancelled) router.replace("/billing");
          return;
        }
      } catch {
        // transient error — keep polling
      }

      if (cancelled) return;
      tries += 1;
      if (tries >= MAX_ATTEMPTS) {
        setTimedOut(true);
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    }

    tick();
    return () => {
      cancelled = true;
    };
  }, [router, dispatch]);

  if (timedOut) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          This is taking longer than expected. Your payment likely went
          through — check your billing page in a moment.
        </p>
        <Link href="/billing" className="text-sm font-medium underline underline-offset-4">
          Go to billing
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Confirming your subscription…</p>
    </div>
  );
}
