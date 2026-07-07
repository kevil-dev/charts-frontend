# Agent Rules — Million Podcasts Frontend

## 1. Always read Next.js docs first
Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`.
Your training data is outdated — the docs are the source of truth.

## 2. Folder structure — strictly enforced

Flat, type-based layout — files are grouped by *what they are* (component, hook,
service, provider, util, constant), not by feature. There is no `src/features/`
directory; do not recreate one.

```
src/
├── app/                    # Routing ONLY — no business logic here
│   ├── (auth)/             # Login, register pages
│   ├── (guest)/            # Public pages (charts, landing, pricing, blog)
│   └── (app)/              # Authenticated-only pages (lists, billing, account)
│
├── components/
│   ├── ui/                 # shadcn primitives — do not modify
│   ├── layout/             # Global layout: navbar, footer, logo
│   │   # AuthButtons.jsx owns the avatar dropdown for authenticated users —
│   │   # My Lists / Billing nav items live there (and in MobileToggle.jsx's
│   │   # mobile equivalent), not in src/constants/navigation.js
│   ├── billing/            # Pricing cards, billing status UI
│   ├── charts/             # All chart UI components
│   ├── lists/              # All lists UI components (dropdowns/modals included, flat — no fragments/ subfolder)
│   └── podcasts/           # Podcast profile UI
│
├── hooks/                  # All data hooks, flat — useCharts.js, useFilters.js, useBillingStatus.js,
│                           # useAddToList.js, useListDetail.js, useLists.js, usePodcastMeta.js
│
├── services/               # All API call modules, flat — authApi.js, chartsApi.js, billingApi.js,
│                           # listsApi.js, podcastMetaApi.js
│
├── providers/              # App-wide Context providers — AuthContext.jsx, ListsCacheContext.jsx,
│                           # QueryProvider.jsx
│
├── utils/                  # Pure helper functions — resolveTier.js, normalise.js
│
├── constants/              # Static app-wide config/data — charts.js (platforms/fallbacks),
│                           # navigation.js (navLinks/footerLinks)
│
└── lib/
    └── api.js              # Axios instance ONLY — no feature logic here
```

## 3. Rules for placing new files

- New chart UI component → `src/components/charts/`
- New chart data hook → `src/hooks/`
- New chart API call → `src/services/chartsApi.js`
- New lists UI component → `src/components/lists/`
- New lists hook → `src/hooks/`
- New lists API call → `src/services/listsApi.js`
- Lists sidebar → `src/components/lists/ListSidebar.jsx`
- Lists sidebar item → `src/components/lists/ListSidebarItem.jsx`
- Lists sidebar client shell → `src/components/lists/ListsSidebarClient.jsx`
- Lists shared cache provider → `src/providers/ListsCacheContext.jsx`
- New billing UI component → `src/components/billing/`
- New billing hook → `src/hooks/`
- New billing API call → `src/services/billingApi.js`
- Tier resolution logic (UI display only, never for access control) →
  `src/utils/resolveTier.js`
- New podcast metadata API call → `src/services/podcastMetaApi.js`
- New podcast metadata hook → `src/hooks/`
- New auth UI component → `src/components/auth/` (doesn't exist yet — create it when the first one is needed)
- New feature entirely → add its components to `src/components/<feature-name>/`, hooks to `src/hooks/`,
  services to `src/services/`, pure helpers to `src/utils/` — do not create a `src/features/` subtree
- Global reusable UI (not feature-specific) → `src/components/ui/` or `src/components/layout/`
- New authenticated page → `src/app/(app)/<page-name>/page.jsx`
- New public page → `src/app/(guest)/<page-name>/page.jsx`
- Never create files directly inside `src/app/` except `layout.tsx` and `globals.css`
- Never add feature logic to `src/lib/api.js`

## 4. Import path conventions

- Always use `@/` alias — never relative `../../` paths
- Auth context: `@/providers/AuthContext`
- Charts API: `@/services/chartsApi`
- Charts hooks: `@/hooks/useCharts` etc.
- Lists API: `@/services/listsApi`
- Lists cache provider: `@/providers/ListsCacheContext`
- Billing API: `@/services/billingApi`
- Tier resolution: `@/utils/resolveTier`
- Podcast metadata API: `@/services/podcastMetaApi`
- Static config/data: `@/constants/charts`, `@/constants/navigation`

## 5. Auth pattern — strictly enforced

- Tokens are stored in httpOnly cookies set by the PHP backend — never localStorage
- The axios instance in `src/lib/api.js` uses `withCredentials: true` — cookies are sent automatically
- Never manually attach Authorization headers on the frontend — the cookie handles it
- Never read or write `mp_token` from JavaScript — it is httpOnly and intentionally inaccessible
- Route protection for `(app)` pages is handled server-side in `src/app/(app)/layout.jsx` via `cookies()` from `next/headers`
- Individual `(app)` pages do NOT need their own auth guard — the layout handles it
- `AuthContext` holds `user` state (null = guest, object = authenticated) and `isLoading` — use these for UI-level conditional rendering only, not for security

## 6. Component conventions

- Every new client component must have `"use client"` at the top
- Server components have no directive — keep them async and import-only
- No direct API calls inside page.jsx — delegate to services/
- No useState/useEffect inside server components

## 7. Do not touch

- `src/components/ui/` — shadcn generated files, never edit manually
- `src/lib/api.js` — only the axios instance lives here, withCredentials: true is required
- `src/constants/charts.js` — platform list and fallbacks, not for feature logic