"use client";

import { GlobeIcon, TrendingUpIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normaliseCountries, normaliseCategories } from "@/features/charts/utils/normalise";

const getFlagImg = (code) => (
  <img 
    src={`https://flagcdn.com/w20/${code?.toLowerCase()}.png`} 
    srcSet={`https://flagcdn.com/w40/${code?.toLowerCase()}.png 2x`}
    width="20" 
    alt="" 
    className="w-5 h-auto rounded-[2px] shadow-sm shrink-0" 
  />
);

/**
 * Country + category dropdowns. Refresh button is in ChartTable (has access to refetch).
 *
 * @param {string}   currentCountry
 * @param {string}   currentCategory
 * @param {Function} onCountryChange
 * @param {Function} onCategoryChange
 * @param {Array}    [countriesList]   — raw API countries from useFilters; null while loading
 * @param {Array}    [categoriesList]  — raw API genres from useFilters; null while loading
 * @param {boolean}  [filtersLoading]  — true while useFilters is in-flight
 */
export default function ChartFilters({
  currentCountry,
  currentCategory,
  onCountryChange,
  onCategoryChange,
  countriesList,
  categoriesList,
  filtersLoading,
  ssrFlag,
}) {
  const countries = countriesList?.length ? normaliseCountries(countriesList) : [];
  const categories = categoriesList?.length ? normaliseCategories(categoriesList) : [];

  const activeCountry = countries.find((c) => c.code === currentCountry?.toLowerCase());
  const activeCategory = categories.find((c) => c.slug === currentCategory);

  const currentFlag = activeCountry?.flag || ssrFlag || "";
  const currentName = activeCountry?.name ?? currentCountry?.toUpperCase() ?? "";
  const currentCategoryLabel = activeCategory?.label ?? currentCategory ?? "";

  return (
    <>
      {/* Country selector */}
      <Select value={currentCountry} onValueChange={onCountryChange}>
        <SelectTrigger
          className="shrink-0 border-none bg-transparent shadow-none focus-visible:ring-0 hover:bg-muted/50 rounded-lg px-3 py-1.5 h-9 text-sm gap-1.5"
          aria-label="Select country"
        >
          {currentCountry
            ? getFlagImg(currentCountry)
            : <GlobeIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          }
          <span className="truncate">{filtersLoading && !activeCountry ? "Loading…" : currentName}</span>
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {countries.map((c) => (
            <SelectItem key={c.code} value={c.code} className="py-2 px-3">
              <div className="flex items-center gap-2">
                {getFlagImg(c.code)}
                <span>{c.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category selector — hidden when the platform has no genres (e.g. YouTube) */}
      {categories.length > 0 && (
        <Select value={currentCategory} onValueChange={onCategoryChange}>
          <SelectTrigger
            className="shrink-0 border-none bg-transparent shadow-none focus-visible:ring-0 hover:bg-muted/50 rounded-lg px-3 py-1.5 h-9 text-sm gap-2"
            aria-label="Select category"
          >
            <TrendingUpIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{filtersLoading && !activeCategory ? "Loading…" : currentCategoryLabel}</span>
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug} className="py-2 px-3">
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Spacer — keeps layout consistent with old design */}
      <div className="flex-1" />
    </>
  );
}
