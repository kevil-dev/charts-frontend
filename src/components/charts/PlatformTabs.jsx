"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { platforms } from "../../../../config/charts";
/** * 
 * @param {object} props
 * @param {string} props.value - The currently active platform slug.
 * @param {(value: string) => void} props.onChange - Callback triggered when a platform is selected.
 */
export default function PlatformTabs({ value, onChange }) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v)}
      className="inline-flex h-10 items-center justify-center rounded-full bg-muted/30 p-1 text-muted-foreground border border-border/40 shadow-sm"
    >
      {platforms.map((p) => (
        <ToggleGroupItem
          key={p.slug}
          value={p.slug}
          className="h-8 rounded-full px-6 text-sm font-semibold transition-all duration-300 ease-out select-none data-[state=on]:bg-[oklch(60%_0.25_280)] data-[state=on]:text-white data-[state=on]:shadow-md hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1"
        >
          {p.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
