"use client";

import React from "react";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { platforms, countries, categories } from "../../../config/charts";

function resolveLabel(segment, index, liveCountries, liveGenres) {
  if (index === 0) {
    return platforms.find((p) => p.slug === segment)?.label ?? segment;
  }
  if (index === 1) {
    // Check live countries first (API shape: { country_code, display_name })
    const live = liveCountries.find(
      (c) => (c.country_code ?? c.code ?? "").toLowerCase() === segment.toLowerCase()
    );
    if (live) return live.display_name ?? live.name ?? segment.toUpperCase();
    // Fall back to static list
    return countries.find((c) => c.code === segment)?.name ?? segment.toUpperCase();
  }
  if (index === 2) {
    // Check live genres first (API shape: { native_id, display_name })
    const live = liveGenres.find((g) => (g.native_id ?? g.slug) === segment);
    if (live) return live.display_name ?? live.label ?? segment;
    // Fall back to static list
    return categories.find((c) => c.slug === segment)?.label ?? segment;
  }
  return segment;
}

export default function DynamicBreadcrumb({ platform, country, category, liveCountries = [], liveGenres = [] }) {
  // Build segments from props — no pathname parsing for labels
  const segments = [platform, country, category].filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/"><HomeIcon className="size-4" /></Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, i) => {
          const label = resolveLabel(segment, i, liveCountries, liveGenres);
          const isLast = i === segments.length - 1;
          const href = "/charts/" + segments.slice(0, i + 1).join("/");

          return (
            <React.Fragment key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
