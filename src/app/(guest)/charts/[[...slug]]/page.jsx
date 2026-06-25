import { redirect } from "next/navigation";
import ChartSection from "@/components/charts/ChartSection";
import ChartErrorBoundary from "@/components/charts/ChartErrorBoundary";
import { platforms, FALLBACK_COUNTRIES, FALLBACK_CATEGORIES } from "../../../../../config/charts";

const VALID_PLATFORMS = platforms.map((p) => p.slug);
const VALID_COUNTRIES = FALLBACK_COUNTRIES.map((c) => c.code);
const VALID_CATEGORIES = FALLBACK_CATEGORIES.map((c) => c.slug);

const DEFAULT = { platform: "apple", country: "us", category: "top" };

function resolveTitle(platform, country, category) {
  const platformLabel = platforms.find((p) => p.slug === platform)?.label ?? platform;
  const countryLabel  = FALLBACK_COUNTRIES.find((c) => c.code === country)?.name ?? country.toUpperCase();
  const categoryLabel = FALLBACK_CATEGORIES.find((c) => c.slug === category)?.label ?? category;
  return { platformLabel, countryLabel, categoryLabel };
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const [platform = DEFAULT.platform, country = DEFAULT.country, category = DEFAULT.category] = slug;
  const { platformLabel, countryLabel, categoryLabel } = resolveTitle(platform, country, category);
  return {
    title: `${platformLabel} · ${countryLabel} · ${categoryLabel} — Million Podcast Charts`,
  };
}

export default async function ChartPage({ params }) {
  const { slug = [] } = await params;

  // No segments → canonical redirect
  if (slug.length === 0) {
    redirect(`/charts/${DEFAULT.platform}/${DEFAULT.country}/${DEFAULT.category}`);
  }

  const [platform, country, category] = slug;

  // Invalid platform → redirect to default
  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    redirect(`/charts/${DEFAULT.platform}/${DEFAULT.country}/${DEFAULT.category}`);
  }

  // Missing country → fill in default, keep valid platform
  if (!country) {
    redirect(`/charts/${platform}/${DEFAULT.country}/${DEFAULT.category}`);
  }

  // Invalid country → redirect keeping valid platform
  if (!VALID_COUNTRIES.includes(country.toLowerCase())) {
    redirect(`/charts/${platform}/${DEFAULT.country}/${DEFAULT.category}`);
  }

  // Missing or invalid category → fill in default
  const resolvedCategory = (!category || !VALID_CATEGORIES.includes(category))
    ? DEFAULT.category
    : category;

  // If category was invalid and we had to fix it, redirect to canonical URL
  if (category && category !== resolvedCategory) {
    redirect(`/charts/${platform}/${country}/${resolvedCategory}`);
  }

  return (
    <ChartErrorBoundary>
      <ChartSection
        platform={platform}
        country={country.toLowerCase()}
        category={resolvedCategory}
      />
    </ChartErrorBoundary>
  );
}
