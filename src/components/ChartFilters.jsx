"use client";

import { GlobeIcon, TrendingUpIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, categories } from "../../config/charts";

// Flag emoji map — keyed to the country codes in config/charts.js
const FLAG = {
  us: "🇺🇸", in: "🇮🇳", uk: "🇬🇧", ca: "🇨🇦", au: "🇦🇺",
  de: "🇩🇪", fr: "🇫🇷", br: "🇧🇷", mx: "🇲🇽", jp: "🇯🇵",
};

/**
 * A component containing the dropdown filters (country and category) and the refresh action.
 * 
 * @param {object} props
 * @param {string} props.currentCountry - The currently selected country code.
 * @param {string} props.currentCategory - The currently selected category slug.
 * @param {(country: string) => void} props.onCountryChange - Callback for country selection change.
 * @param {(category: string) => void} props.onCategoryChange - Callback for category selection change.
 * @param {() => void} [props.onRefresh] - Optional callback for the refresh button.
 */
export default function ChartFilters({
  currentCountry,
  currentCategory,
  onCountryChange,
  onCategoryChange,
  onRefresh,
}) {
  return (
    <>
      {/* Country selector */}
      <Select value={currentCountry} onValueChange={onCountryChange}>
        <SelectTrigger
          className="shrink-0 border-none bg-transparent shadow-none focus-visible:ring-0 hover:bg-muted/50 rounded-lg px-3 py-1.5 h-9 text-sm"
          aria-label="Select country"
        >
          {/* Custom trigger label: flag + code */}
          <span className="text-base leading-none" aria-hidden="true">
            {FLAG[currentCountry] ?? <GlobeIcon className="size-4 text-muted-foreground" />}
          </span>
          <span className="text-xs font-mono font-medium uppercase text-muted-foreground">
            {currentCountry}
          </span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {countries.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="mr-2" aria-hidden="true">{FLAG[c.code]}</span>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category selector */}
      <Select value={currentCategory} onValueChange={onCategoryChange}>
        <SelectTrigger
          className="shrink-0 border-none bg-transparent shadow-none focus-visible:ring-0 hover:bg-muted/50 rounded-lg px-3 py-1.5 h-9 text-sm gap-2"
          aria-label="Select category"
        >
          <TrendingUpIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Push refresh to the far right */}
      <div className="flex-1" />

      {/* Refresh */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="shrink-0 gap-1.5 h-8 text-xs font-medium rounded-lg px-3"
        aria-label="Refresh chart data"
      >
        <RefreshCwIcon className="size-3" />
        Refresh
      </Button>
    </>
  );
}
