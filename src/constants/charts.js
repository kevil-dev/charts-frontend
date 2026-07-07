// Platforms are static — no API endpoint for these
export const platforms = [
  { slug: "apple",   label: "Apple" },
  { slug: "spotify", label: "Spotify" },
  { slug: "youtube", label: "YouTube" },
];

// Countries and categories are now API-driven via useFilters / GET /charts/filters.
// The arrays below are FALLBACKS used for:
//   1. First-render before the API responds (DynamicBreadcrumb, ChartFilters)
//   2. SSR where useFilters cannot run
// Do not add new entries here — they will be overridden by live API data.

export const FALLBACK_COUNTRIES = [
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ca", name: "Canada",         flag: "🇨🇦" },
  { code: "au", name: "Australia",      flag: "🇦🇺" },
  { code: "in", name: "India",          flag: "🇮🇳" },
  { code: "de", name: "Germany",        flag: "🇩🇪" },
  { code: "fr", name: "France",         flag: "🇫🇷" },
  { code: "br", name: "Brazil",         flag: "🇧🇷" },
  { code: "mx", name: "Mexico",         flag: "🇲🇽" },
  { code: "jp", name: "Japan",          flag: "🇯🇵" },
];

export const FALLBACK_CATEGORIES = [
  { slug: "top",        label: "Top Podcasts" },
  { slug: "arts",       label: "Arts" },
  { slug: "comedy",     label: "Comedy" },
  { slug: "education",  label: "Education" },
  { slug: "news",       label: "News" },
  { slug: "sports",     label: "Sports" },
  { slug: "technology", label: "Technology" },
  { slug: "business",   label: "Business" },
  { slug: "health",     label: "Health & Fitness" },
  { slug: "music",      label: "Music" },
];

// Legacy named exports — kept so existing imports in ChartFilters.jsx and
// DynamicBreadcrumb.jsx don't break. They resolve to the fallback arrays.
export const countries  = FALLBACK_COUNTRIES;
export const categories = FALLBACK_CATEGORIES;
