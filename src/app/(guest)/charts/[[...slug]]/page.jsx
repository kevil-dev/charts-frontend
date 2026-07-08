import { cache } from "react";
import { redirect } from "next/navigation";
import ChartSection from "@/components/charts/ChartSection";
import ChartStoreSeeder from "@/components/charts/ChartStoreSeeder";
import { platforms } from "@/constants/charts";

const VALID_PLATFORMS = platforms.map((p) => p.slug);
const DEFAULT = { platform: "apple", country: "us", category: "top" };
const FALLBACK_URL = `/charts/${DEFAULT.platform}/${DEFAULT.country}/${DEFAULT.category}`;

const fetchMeta = cache(async (platform, country, category) => {
  const backendUrl = process.env.INTERNAL_API_URL;
  try {
    const res = await fetch(
      `${backendUrl}/charts/meta?platform=${platform}&country=${country}&chart=${category}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
});

const fetchCharts = cache(async (platform, country, category, page) => {
  const backendUrl = process.env.INTERNAL_API_URL;
  try {
    const params = new URLSearchParams({
      platform,
      country: country.toUpperCase(),
      chart: category,
      page: String(page),
      limit: "50",
    });
    const res = await fetch(`${backendUrl}/charts?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
});

function computeCanonicalSlug(slug) {
  const [platform, country, category] = slug;

  const resolvedPlatform =
    platform && VALID_PLATFORMS.includes(platform) ? platform : DEFAULT.platform;
  const resolvedCountry = country || DEFAULT.country;
  const resolvedCategory = category || DEFAULT.category;

  const isCanonical =
    resolvedPlatform === platform &&
    resolvedCountry === country &&
    resolvedCategory === category;

  if (isCanonical) return null;

  return `/charts/${resolvedPlatform}/${resolvedCountry}/${resolvedCategory}`;
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const [platform = DEFAULT.platform, country = DEFAULT.country, category = DEFAULT.category] = slug;
  const meta = await fetchMeta(platform, country, category);
  if (!meta) return { title: "Million Podcast Charts" };
  return {
    title: `${meta.platform_label} · ${meta.country_name} · ${meta.chart_label} — Million Podcast Charts`,
  };
}

export default async function ChartPage({ params, searchParams }) {
  const { slug = [] } = await params;
  const resolvedSearch = await searchParams;

  const canonicalUrl = computeCanonicalSlug(slug);
  if (canonicalUrl) redirect(canonicalUrl);

  const [platform, country, category] = slug;
  const lowerCountry = country.toLowerCase();
  const currentPage = Math.max(1, parseInt(resolvedSearch?.page) || 1);

  const [meta, charts] = await Promise.all([
    fetchMeta(platform, country, category),
    fetchCharts(platform, lowerCountry, category, currentPage),
  ]);

  if (!meta) redirect(FALLBACK_URL);

  return (
    <>
      {charts && (
        <ChartStoreSeeder
          chartsData={charts}
          platform={platform}
          country={lowerCountry}
          category={category}
          page={currentPage}
        />
      )}
      <ChartSection
        platform={platform}
        country={lowerCountry}
        category={category}
        platformLabel={meta.platform_label}
        countryName={meta.country_name}
        countryFlag={meta.country_flag}
        chartLabel={meta.chart_label}
        currentPage={currentPage}
      />
    </>
  );
}
