"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { billingApi } from "@/services/billingApi";
import { useAuth } from "@/providers/AuthContext";
import BillingCard from "@/components/billing/BillingCard";
import CancelRow from "@/components/billing/CancelRow";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr.replace(" ", "T")).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

import confetti from "canvas-confetti";
import { CheckIcon } from "lucide-react";

function PlanBenefits({ tier }) {
  const benefits = {
    pro: [
      "Full US Apple & Spotify Charts",
      "Up to 5 custom lists",
      "Advanced Rank Analytics",
      "Platform & Genre Filtering",
      "Standard Support",
    ],
    elite: [
      "Global Footprint Analytics",
      "Infinite custom lists",
      "CSV, JSON & Email Exports",
      "Historical Rank Area Charts",
      "Priority Support",
      "Access to all future features",
    ]
  };

  const list = benefits[tier] || benefits.pro;

  return (
    <div className="mt-12 px-4 md:px-0">
      <h3 className="text-lg font-bold tracking-tight mb-6">Your Plan Benefits</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {list.map((benefit, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card shadow-sm">
            <div className="flex items-center justify-center size-8 rounded-full bg-[var(--brand-indigo)]/10 text-[var(--brand-indigo)] shrink-0">
              <CheckIcon className="size-4" />
            </div>
            <p className="text-sm font-medium">{benefit}</p>
          </div>
        ))}
      </div>
    </div>
  );
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

  const {
    plan_status,
    selected_tier,
    trial_ends_at,
    current_period_end,
    cancel_at_period_end,
    interval,
    amount,
    card_brand,
    card_last4,
  } = data;

  if (!plan_status) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Current plan
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">Free</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re on the Free plan. Upgrade for full show profiles, more lists,
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

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      await billingApi.upgrade();
      await queryClient.invalidateQueries({ queryKey: ["billing-status"] });
      await refetchUser();
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7928ca', '#ff0080', '#00dfd8', '#f9cb28']
      });
      toast.success("Welcome to Elite! You've been upgraded.");
    } catch (err) {
      toast.error(err.message || "Couldn't upgrade — please try again.");
    } finally {
      setUpgrading(false);
    }
  }

  async function handleConfirmCancel() {
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
    <div className="max-w-4xl pb-24">
      <BillingCard
        planStatus={plan_status}
        selectedTier={selected_tier}
        trialEndsAt={trial_ends_at}
        currentPeriodEnd={current_period_end}
        cancelAtPeriodEnd={cancel_at_period_end}
        interval={interval}
        amount={amount}
        cardBrand={card_brand}
        cardLast4={card_last4}
        onUpgrade={handleUpgrade}
        upgrading={upgrading}
      />
      <CancelRow
        planStatus={plan_status}
        cancelAtPeriodEnd={cancel_at_period_end}
        currentPeriodEnd={current_period_end}
        onCancelClick={() => setConfirming(true)}
        onConfirmCancel={handleConfirmCancel}
        onKeep={() => setConfirming(false)}
        canceling={canceling}
        confirming={confirming}
      />
      <PlanBenefits tier={selected_tier} />
    </div>
  );
}
