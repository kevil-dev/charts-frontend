"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { platforms } from "../../../config/charts";

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
      spacing={0}
      className="inline-flex h-9 items-center justify-center rounded-full bg-muted/65 p-0.5 text-muted-foreground border border-border/10 shadow-inner"
    >
      {platforms.map((p) => (
        <ToggleGroupItem
          key={p.slug}
          value={p.slug}
          className="h-8 rounded-full px-5 text-sm font-medium transition-all duration-200 ease-out select-none data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1"
        >
          {p.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
