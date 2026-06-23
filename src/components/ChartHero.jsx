"use client";

import { usePathname, useRouter } from "next/navigation";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import PlatformTabs from "@/components/PlatformTabs";
import ChartFilters from "@/components/ChartFilters";
import { platforms, countries, categories } from "../../config/charts";

export default function ChartHero() {
  const pathname = usePathname();
  const router = useRouter();

  // URL shape: /charts/[platform]/[country]/[category]
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] = "charts", [1] = platform, [2] = country, [3] = category
  const currentPlatform = segments[1] ?? platforms[0].slug;
  const currentCountry  = segments[2] ?? countries[0].code;
  const currentCategory = segments[3] ?? categories[0].slug;

  /** Push a new URL, preserving whatever segments aren't being changed. */
  function navigate({ platform, country, category } = {}) {
    const p   = platform ?? currentPlatform;
    const c   = country  ?? currentCountry;
    const cat = category ?? currentCategory;
    router.push(`/charts/${p}/${c}/${cat}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <DynamicBreadcrumb />

      {/* Title + subtitle */}
      <div>
        <h1 className="text-5xl font-semibold tracking-tighter">
          The podcast chart.
        </h1>
        <p className="mt-3 max-w-lg text-lg text-muted-foreground">
          Every show ranked across Apple, Spotify, and YouTube — refreshed
          daily, with movement, hosts, and reach in one view.
        </p>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border bg-background px-2 py-1.5 shadow-sm">
        {/* Platform segmented control */}
        <PlatformTabs
          value={currentPlatform}
          onChange={(v) => navigate({ platform: v })}
        />

        {/* Divider */}
        <div className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />

        {/* Country & Category Dropdowns + Refresh Action */}
        <ChartFilters
          currentCountry={currentCountry}
          currentCategory={currentCategory}
          onCountryChange={(v) => navigate({ country: v })}
          onCategoryChange={(v) => navigate({ category: v })}
        />
      </div>
      {/* ── /Filter bar ────────────────────────────────────────────────────── */}
    </div>
  );
}

