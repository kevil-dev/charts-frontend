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

export default function DynamicBreadcrumb({ platform, country, category, platformLabel, countryName, chartLabel }) {
  const segments = [
    { slug: platform, label: platformLabel ?? platform,                href: `/charts/${platform}` },
    { slug: country,  label: countryName  ?? country.toUpperCase(),   href: `/charts/${platform}/${country}` },
    { slug: category, label: chartLabel   ?? category,                 href: `/charts/${platform}/${country}/${category}` },
  ].filter((s) => s.slug);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/"><HomeIcon className="size-4" /></Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <React.Fragment key={seg.slug}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={seg.href}>{seg.label}</Link>
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
