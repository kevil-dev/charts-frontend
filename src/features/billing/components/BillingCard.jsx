"use client";

import { Loader2Icon } from "lucide-react";

const TRIAL_DAYS = 14;

const STATUS_BADGE = {
  trialing: { label: "Trialing", bg: "#00dfd8", color: "#004d4a" },
  active: { label: "Active", bg: "#00c48c", color: "#003d2b" },
  past_due: { label: "Past due", bg: "#f5a623", color: "#5a3a00" },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr.replace(" ", "T")).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BillingCard({
  planStatus,
  selectedTier,
  trialEndsAt,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  interval,
  amount,
  cardBrand,
  cardLast4,
  onUpgrade,
  upgrading,
}) {
  const isTrialing = planStatus === "trialing";
  const isPastDue = planStatus === "past_due";
  const badge = STATUS_BADGE[planStatus];
  const suffix = interval === "monthly" ? "mo" : "yr";
  const formattedPeriodEnd = formatDate(currentPeriodEnd);

  let daysLeft = 0;
  let trialPct = 0;
  if (isTrialing && trialEndsAt) {
    // eslint-disable-next-line react-hooks/purity
    const msLeft = new Date(trialEndsAt.replace(" ", "T")).getTime() - Date.now();
    daysLeft = Math.max(0, Math.ceil(msLeft / 86_400_000));
    trialPct = Math.min(100, (daysLeft / TRIAL_DAYS) * 100);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: "#171717" }}>
      <div
        className="absolute top-0 right-0 h-full pointer-events-none z-0"
        style={{
          width: "55%",
          background:
            "radial-gradient(ellipse at top right, rgba(121,40,202,0.45) 0%, rgba(255,0,128,0.2) 40%, transparent 70%)",
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Row 1: header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center" style={{ gap: "10px" }}>
            <span className="font-bold" style={{ fontSize: "28px", color: "#ffffff" }}>
              {selectedTier === "elite" ? "Elite" : "Pro"}
            </span>
            {badge && (
              <span
                className="rounded-full px-3 py-1 font-semibold"
                style={{ background: badge.bg, color: badge.color, fontSize: "13px" }}
              >
                {badge.label}
              </span>
            )}
          </div>

          {amount !== null && (
            <div className="flex items-baseline gap-1">
              <span className="font-bold" style={{ fontSize: "28px", color: "#ffffff" }}>
                ₹{amount}
              </span>
              <span className="text-base" style={{ color: "#a1a1a1" }}>
                /{suffix}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: trial bar */}
        {isTrialing && (
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "#c9c9c9" }}>
                Free trial
              </span>
              <span className="font-bold text-sm" style={{ color: "#ffffff" }}>
                {daysLeft} days left
              </span>
            </div>
            <div className="w-full h-1 rounded-sm mt-2" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="h-full rounded-sm"
                style={{
                  width: `${trialPct}%`,
                  background: "linear-gradient(90deg, #00dfd8, #007cf0, #7928ca, #f9cb28)",
                }}
              />
            </div>
          </div>
        )}

        {isTrialing && (
          <div className="border-t border-solid mt-4" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
        )}

        {/* Row 3: footer */}
        <div className={`flex justify-between items-center ${isTrialing ? "" : "mt-4"}`}>
          <div className="text-sm" style={{ color: isPastDue ? "#f5a623" : "#a1a1a1" }}>
            {isTrialing &&
              `First charge ${formattedPeriodEnd} · ₹${amount}/${suffix}`}
            {planStatus === "active" && (
              <>
                Renews {formattedPeriodEnd}
                {cardBrand && cardLast4 && (
                  <>
                    {" · "}
                    {cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)} •••• {cardLast4}
                  </>
                )}
              </>
            )}
            {isPastDue && "Payment failed — update your payment method"}
          </div>

          <div>
            {isPastDue ? null : selectedTier === "elite" ? (
              <>
                <span style={{ color: "#f9cb28" }}>★</span>
                <span style={{ color: "#a1a1a1", marginLeft: "6px", fontSize: "13px" }}>
                  Highest tier
                </span>
              </>
            ) : selectedTier === "pro" ? (
              <button
                onClick={onUpgrade}
                disabled={upgrading}
                className="font-semibold whitespace-nowrap"
                style={{
                  background: "#ffffff",
                  color: "#171717",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "14px",
                }}
              >
                {upgrading && <Loader2Icon className="inline size-4 animate-spin mr-1" />}
                Upgrade to Elite →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
