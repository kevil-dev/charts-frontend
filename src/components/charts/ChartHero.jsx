"use client";

import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";
import DynamicBreadcrumb from "./DynamicBreadcrumb";
import PlatformTabs from "./PlatformTabs";
import ChartFilters from "./ChartFilters";
import { useFilters } from "@/hooks/useFilters";

export default function ChartHero({
  platform,
  country,
  category,
  platformLabel,
  countryName,
  countryFlag,
  chartLabel,
  runDate,
  refetch,
  isFetching,
}) {
  const router = useRouter();

  const currentPlatform = platform;
  const currentCountry = country;
  const currentCategory = category;

  const {
    countries: liveCountries,
    genres: liveGenres,
    isLoading: filtersLoading,
  } = useFilters({ platform: currentPlatform, country: currentCountry });

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
      <div className="self-start inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#0070f3] animate-[livePulse_1.8s_ease-in-out_infinite]" />
        <span className="font-mono text-[11px] font-normal uppercase tracking-[0.06em] text-muted-foreground">
          Last updated: {runDate}
        </span>
      </div>

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
        />

        {/* Divider */}
        <div className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />

        {/* Refresh */}
        <button
          onClick={refetch}
          disabled={isFetching || !refetch}
          aria-label="Refresh chart data"
          className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCwIcon
            className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {/* ── /Filter bar ────────────────────────────────────────────────────── */}
    </div>
  );
}
