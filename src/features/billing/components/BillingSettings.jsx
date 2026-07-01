"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { useBillingStatus } from "@/features/billing/hooks/useBillingStatus";
import { billingApi } from "@/features/billing/services/billingApi";
import { useAuth } from "@/features/auth/context/AuthContext";

const STATUS_LABELS = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  unpaid: "Unpaid",
};

const TIER_NAMES = { pro: "Pro", elite: "Elite" };

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr.replace(" ", "T")).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BillingSettings() {
  const { data, isLoading } = useBillingStatus();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const { plan_status, selected_tier, trial_ends_at, current_period_end, cancel_at_period_end } = data;

  if (!plan_status) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Current plan
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">Free</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You're on the Free plan. Upgrade for full show profiles, more lists,
          and deeper analytics.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
        >
          View plans
        </Link>
      </div>
    );
  }

  const tierName = TIER_NAMES[selected_tier] ?? selected_tier;
  const statusLabel = STATUS_LABELS[plan_status] ?? plan_status;
  const canCancel = ["trialing", "active"].includes(plan_status) && !cancel_at_period_end;

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      await billingApi.upgrade();
      await queryClient.invalidateQueries({ queryKey: ["billing-status"] });
      await refetchUser();
      toast("Upgraded to Elite.");
    } catch (err) {
      toast.error(err.message || "Couldn't upgrade — please try again.");
    } finally {
      setUpgrading(false);
    }
  }

  async function handleCancel() {
    setCanceling(true);
    try {
      await billingApi.cancel();
      await queryClient.invalidateQueries({ queryKey: ["billing-status"] });
      toast(`Subscription will end on ${formatDate(current_period_end) ?? "the current period end"}.`);
      setConfirming(false);
    } catch (err) {
      toast.error(err.message || "Couldn't cancel — please try again.");
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Current plan
        </p>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground">
          {statusLabel}
        </span>
      </div>

      <h2 className="mt-1 text-2xl font-bold tracking-tight">{tierName}</h2>

      {plan_status === "trialing" && trial_ends_at && (
        <p className="mt-2 text-sm text-muted-foreground">
          Trial ends {formatDate(trial_ends_at)}
        </p>
      )}

      {cancel_at_period_end ? (
        <p className="mt-2 text-sm text-destructive">
          Cancels on {formatDate(current_period_end)}
        </p>
      ) : (
        current_period_end && (
          <p className="mt-2 text-sm text-muted-foreground">
            Next billing date {formatDate(current_period_end)}
          </p>
        )
      )}

      {selected_tier === "pro" && ["trialing", "active"].includes(plan_status) && (
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="mt-4 flex items-center gap-2 rounded-lg bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {upgrading && <Loader2Icon className="size-4 animate-spin" />}
          Upgrade to Elite
        </button>
      )}

      {canCancel && (
        <div className="mt-5 border-t border-border pt-5">
          {confirming && (
            <p className="mb-3 text-sm text-muted-foreground">
              Cancel subscription? You'll keep access until{" "}
              {formatDate(current_period_end) ?? "the end of the billing period"}.
            </p>
          )}
          <div className="flex gap-2">
            {confirming ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                >
                  {canceling && <Loader2Icon className="size-4 animate-spin" />}
                  Yes, cancel
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={canceling}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Keep subscription
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="text-sm font-medium text-destructive hover:underline"
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
