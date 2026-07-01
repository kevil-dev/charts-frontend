"use client";

import Link from "next/link";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

function getCtaClasses(tier, isDark) {
  if (isDark) {
    return "flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-[#171717] transition-opacity hover:opacity-80 disabled:opacity-50";
  }
  if (tier === "free") {
    return "flex w-full items-center justify-center gap-2 rounded-lg border border-[#ebebeb] bg-white px-4 py-2.5 text-sm font-medium text-[#171717] transition-colors hover:border-[#a1a1a1] hover:bg-[#fafafa] disabled:opacity-50";
  }
  return "flex w-full items-center justify-center gap-2 rounded-lg border border-[#171717] bg-white px-4 py-2.5 text-sm font-medium text-[#171717] transition-colors hover:bg-[#171717] hover:text-white disabled:opacity-50";
}

export default function PricingCard({ tier, name, subtitle, price, features, cta, highlighted = false }) {
  const isDark = highlighted;
  const ctaClasses = getCtaClasses(tier, isDark);

  return (
    <div
      className={[
        "relative flex flex-col rounded-xl p-6 overflow-hidden",
        isDark
          ? "bg-[#171717] text-white border border-[#2a2a2e] shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
          : "bg-white border border-[rgba(0,0,0,0.08)] text-foreground shadow-[0_2px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
        {highlighted && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#171717]"
            style={{ background: "linear-gradient(90deg, #00dfd8, #7928ca, #ff0080)" }}
          >
            Most popular
          </span>
        )}
      </div>

      {subtitle && (
        <p className={`mt-1 text-sm ${isDark ? "text-[#a1a1a1]" : "text-[#4d4d4d]"}`}>
          {subtitle}
        </p>
      )}

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">{price.amount}</span>
        <span className={isDark ? "text-[#a1a1a1]" : "text-muted-foreground"}>{price.period}</span>
      </div>
      {price.note && (
        <p className={`mt-1 text-xs ${isDark ? "text-[#a1a1a1]" : "text-muted-foreground"}`}>
          {price.note}
        </p>
      )}

      <div className="mt-6">
        {cta?.disabledLabel ? (
          <p className="flex w-full items-center justify-center rounded-lg border border-[#ebebeb] bg-[#fafafa] px-4 py-2.5 text-sm font-medium text-muted-foreground">
            {cta.label}
          </p>
        ) : cta?.href ? (
          <Link href={cta.href} className={ctaClasses}>
            {cta.label}
          </Link>
        ) : cta?.onClick ? (
          <button onClick={cta.onClick} disabled={cta.pending} className={ctaClasses}>
            {cta.pending && <Loader2Icon className="size-4 animate-spin" />}
            {cta.label}
          </button>
        ) : (
          <div className="h-[42px]" aria-hidden="true" />
        )}
      </div>

      <div className={`my-5 h-px ${isDark ? "bg-white/10" : "bg-border"}`} />

      <ul className="flex flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckIcon className={`mt-0.5 size-4 shrink-0 ${isDark ? "text-[#00dfd8]" : "text-[#171717]"}`} />
            <span className={isDark ? "text-[#ededed]" : "text-foreground"}>{f}</span>
          </li>
        ))}
      </ul>

      {highlighted && (
        <>
          <BorderBeam
            duration={6}
            size={400}
            borderWidth={2}
            className="from-transparent via-[#00dfd8] to-transparent"
          />
          <BorderBeam
            duration={6}
            delay={3}
            size={400}
            borderWidth={2}
            className="from-transparent via-[#ff0080] to-transparent"
          />
        </>
      )}
    </div>
  );
}
