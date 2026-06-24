import ChartSection from "@/components/ChartSection";
import { platforms, FALLBACK_COUNTRIES, FALLBACK_CATEGORIES } from "../../../../../config/charts";

/** Resolve a human-readable title segment from the slug values */
function resolveTitle(platform, country, category) {
  const platformLabel  = platforms.find((p) => p.slug === platform)?.label ?? platform;
  const countryLabel   = FALLBACK_COUNTRIES.find((c) => c.code === country)?.name ?? country.toUpperCase();
  const categoryLabel  = FALLBACK_CATEGORIES.find((c) => c.slug === category)?.label ?? category;
  return { platformLabel, countryLabel, categoryLabel };
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const [platform = "apple", country = "us", category = "top"] = slug;
  const { platformLabel, countryLabel, categoryLabel } = resolveTitle(platform, country, category);
  return {
    title: `${platformLabel} · ${countryLabel} · ${categoryLabel} — Million Podcast Charts`,
  };
}

export default async function ChartPage({ params }) {
  const { slug = [] } = await params;
  const [platform = "apple", country = "us", category = "top"] = slug;

  return (
    <ChartSection platform={platform} country={country} category={category} />
  );
}
