"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser, fetchUser } from "@/store/authSlice";
import { useCheckoutMutation, useUpgradeMutation } from "@/services/billingApiSlice";
import { resolveTier } from "@/utils/resolveTier";
import PricingCard from "./PricingCard";

const PRICING = {
  pro: { monthly: 499, yearly: 4990, yearlyEquivalent: 416 },
  elite: { monthly: 999, yearly: 9990, yearlyEquivalent: 833 },
};
const SAVE_PERCENT = 17;

const TIERS = [
  {
    tier: "free",
    name: "Free",
    subtitle: "Get a feel for how your show ranks.",
    features: ["Browse full charts", "1 list", "Basic podcast info (genre, author, episodes)"],
  },
  {
    tier: "pro",
    name: "Pro",
    subtitle: "For creators who track their rank closely.",
    features: ["Everything in Free", "Full show profiles", "20 lists", "All depth fields"],
    highlighted: true,
  },
  {
    tier: "elite",
    name: "Elite",
    subtitle: "Deep analytics for serious podcast teams.",
    features: ["Everything in Pro", "Ratings & rank trends", "Unlimited lists"],
  },
];

export default function PricingSection() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [pendingTier, setPendingTier] = useState(null);
  const userTier = resolveTier(user);
  const [checkout] = useCheckoutMutation();
  const [upgrade] = useUpgradeMutation();

  async function handleCheckout(tier) {
    setPendingTier(tier);
    try {
      const res = await checkout({ tier, interval: billingInterval }).unwrap();
      window.location.href = res.url;
    } catch (err) {
      toast.error(err.message || "Something went wrong — please try again.");
      setPendingTier(null);
    }
  }

  async function handleUpgrade() {
    setPendingTier("elite");
    try {
      await upgrade().unwrap();
      await dispatch(fetchUser());
      toast("Upgraded to Elite.");
    } catch (err) {
      toast.error(err.message || "Something went wrong — please try again.");
    } finally {
      setPendingTier(null);
    }
  }

  function getCta(tier) {
    if (tier === "free") {
      if (!user) return { label: "Get started", href: "/register" };
      if (userTier === "free") return { label: "Your current plan", disabledLabel: true };
      return null; // Pro and Elite users don't see a CTA on the Free tier card
    }

    if (!user) {
      return { label: "Start free trial", href: "/register?from=/pricing" };
    }

    if (userTier === tier) {
      return { label: "Manage subscription", href: "/billing" };
    }

    if (userTier === "pro" && tier === "elite") {
      return {
        label: pendingTier === "elite" ? "Upgrading…" : "Upgrade to Elite",
        onClick: () => handleUpgrade(),
        pending: pendingTier === "elite",
      };
    }

    if (userTier === "pro" || userTier === "elite") {
      return null; // no downgrade path
    }

    // Free users
    return {
      label: pendingTier === tier ? "Redirecting…" : "Start free trial",
      onClick: () => handleCheckout(tier),
      pending: pendingTier === tier,
    };
  }

  function priceLine(tier) {
    const p = PRICING[tier];
    if (billingInterval === "yearly") {
      return {
        amount: `₹${p.yearlyEquivalent}`,
        period: "/mo",
        note: `₹${p.yearly.toLocaleString("en-IN")} billed yearly`,
      };
    }
    return { amount: `₹${p.monthly}`, period: "/mo", note: null };
  }

  return (
    <>
      {/* Full-page animated background for the rest of the page */}
      <div className="refined-mesh-full" aria-hidden="true" />

      {/* Hero — full-width, flush with navbar, contains the original mesh */}
      <section className="relative overflow-hidden">
        <div className="hero-mesh" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-xl px-4 pt-10 pb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Pricing
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Never miss a move in the charts.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Start free. Upgrade for deeper history, richer metadata, and unlimited lists.
          </p>
        </div>
      </section>

      {/* Cards */}
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 pb-16 pt-6">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
          <button
            onClick={() => setBillingInterval("monthly")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billingInterval === "monthly"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("yearly")}
            className={[
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billingInterval === "yearly"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Annual
            <span
              className={[
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                billingInterval === "yearly"
                  ? "bg-[#00dfd8] text-[#171717]"
                  : "bg-[#ececed] text-muted-foreground",
              ].join(" ")}
            >
              Save {SAVE_PERCENT}%
            </span>
          </button>
        </div>

        <div className="grid w-full gap-6 sm:grid-cols-3">
          {TIERS.map((t) => (
            <PricingCard
              key={t.tier}
              tier={t.tier}
              name={t.name}
              subtitle={t.subtitle}
              price={t.tier === "free" ? { amount: "₹0", period: "/mo", note: null } : priceLine(t.tier)}
              features={t.features}
              cta={getCta(t.tier)}
              highlighted={t.highlighted}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          All paid plans include a 14-day trial. Cancel anytime. Prices in INR.
        </p>
      </div>
    </>
  );
}
