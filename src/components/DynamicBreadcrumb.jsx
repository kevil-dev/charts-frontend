"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { platforms, countries, categories } from "../../config/charts";

function resolveLabel(segment, index) {
  if (index === 0) return platforms.find((p) => p.slug === segment)?.label ?? segment;
  if (index === 1) return countries.find((c) => c.code === segment)?.name ?? segment.toUpperCase();
  if (index === 2) return categories.find((c) => c.slug === segment)?.label ?? segment;
  return segment;
}

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1); // strip 'charts'

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/"><HomeIcon className="size-4" /></Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, i) => {
          const label = resolveLabel(segment, i);
          const isLast = i === segments.length - 1;

          return (
            <React.Fragment key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
