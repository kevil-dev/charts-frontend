"use client";

import { useRouter } from "next/navigation";
import DynamicBreadcrumb from "./DynamicBreadcrumb";
import PlatformTabs from "./PlatformTabs";
import ChartFilters from "./ChartFilters";
import { useGetFiltersQuery } from "@/services/chartsApiSlice";

export default function ChartHero({
  platform,
  country,
  category,
  platformLabel,
  countryName,
  countryFlag,
  chartLabel,
  runDate,
}) {
  const router = useRouter();

  const currentPlatform = platform;
  const currentCountry = country;
  const currentCategory = category;

  const { data, isLoading: filtersLoading } = useGetFiltersQuery(
    { platform: currentPlatform, country: currentCountry },
    { skip: !currentPlatform }
  );
  const liveCountries = data?.countries;
  const liveGenres = data?.genres;

  /** Push a new URL, preserving whatever segments aren't being changed. */
  function navigate({ platform, country, category } = {}) {
    const p = platform ?? currentPlatform;
    const c = country ?? currentCountry;
    const cat = category ?? currentCategory;
    router.push(`/charts/${p}/${c}/${cat}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <DynamicBreadcrumb
        platform={currentPlatform}
        country={currentCountry}
        category={currentCategory}
        platformLabel={platformLabel}
        countryName={countryName}
        chartLabel={chartLabel}
      />

      {/* Live badge */}
      <div className="self-start inline-flex items-center gap-2 rounded-full border border-[oklch(60%_0.25_280)]/20 bg-[oklch(60%_0.25_280)]/5 px-3 py-1 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(60%_0.25_280)] animate-[livePulse_1.8s_ease-in-out_infinite]" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[oklch(60%_0.25_280)]">
          Last updated: {runDate}
        </span>
      </div>

      {/* Title + subtitle */}
      <div>
        <h1 className="text-6xl sm:text-7xl font-bold tracking-[-0.05em] text-foreground leading-[0.95]">
          The podcast chart.
        </h1>
        <p className="mt-4 max-w-xl text-lg sm:text-xl font-medium tracking-[-0.01em] text-muted-foreground leading-relaxed">
          Every show ranked across Apple, Spotify, and YouTube — refreshed
          daily, with movement, hosts, and reach in one view.
        </p>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border bg-background px-2 py-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]">
        {/* Platform segmented control */}
        <PlatformTabs
          value={currentPlatform}
          onChange={(v) =>
            v === "youtube"
              ? navigate({ platform: v, country: "us", category: "top" })
              : navigate({ platform: v })
          }
        />

        {/* Divider */}
        <div className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />

        {/* Country & Category Dropdowns + Refresh Action */}
        <ChartFilters
          currentCountry={currentCountry}
          currentCategory={currentCategory}
          onCountryChange={(v) => navigate({ country: v })}
          onCategoryChange={(v) => navigate({ category: v })}
          countriesList={liveCountries}
          categoriesList={liveGenres}
          filtersLoading={filtersLoading}
          ssrFlag={countryFlag}
        />

      </div>
      {/* ── /Filter bar ────────────────────────────────────────────────────── */}
    </div>
  );
}
