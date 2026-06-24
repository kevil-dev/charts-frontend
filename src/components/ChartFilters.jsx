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
import { countries as STATIC_COUNTRIES, categories as STATIC_CATEGORIES } from "../../config/charts";

// Normalise API country objects { country_code, display_name, flag } to the internal shape
function normaliseCountries(apiList) {
  return apiList.map((c) => ({
    code: c.country_code?.toLowerCase() ?? c.code,
    name: c.display_name ?? c.name,
    flag: c.flag ?? "",
  }));
}

// Normalise API genre objects { native_id, name, ... } to the internal shape
// TODO: confirm the label field name from the real API genre object
function normaliseCategories(apiList) {
  return apiList.map((g) => ({
    slug:  g.native_id ?? g.slug,
    label: g.name ?? g.label ?? g.native_id,
  }));
}

/**
 * A component containing the dropdown filters (country and category) and the refresh action.
 * 
 * @param {object} props
 * @param {string} props.currentCountry - The currently selected country code.
 * @param {string} props.currentCategory - The currently selected category slug.
 * @param {(country: string) => void} props.onCountryChange - Callback for country selection change.
 * @param {(category: string) => void} props.onCategoryChange - Callback for category selection change.
 * @param {() => void} [props.onRefresh] - Optional callback for the refresh button.
 * @param {Array}  [props.countriesList] - Live country list from useFilters (API-driven).
 * @param {Array}  [props.categoriesList] - Live genre list from useFilters (API-driven).
 */
export default function ChartFilters({
  currentCountry,
  currentCategory,
  onCountryChange,
  onCategoryChange,
  onRefresh,
  countriesList,
  categoriesList,
}) {
  const countries  = countriesList  ? normaliseCountries(countriesList)  : STATIC_COUNTRIES;
  const categories = categoriesList ? normaliseCategories(categoriesList) : STATIC_CATEGORIES;
  const currentFlag = countries.find((c) => c.code === currentCountry)?.flag;
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
            {currentFlag ?? <GlobeIcon className="size-4 text-muted-foreground" />}
          </span>
          <span className="text-xs font-mono font-medium uppercase text-muted-foreground">
            {currentCountry}
          </span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {countries.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.flag && <span className="mr-2" aria-hidden="true">{c.flag}</span>}
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
