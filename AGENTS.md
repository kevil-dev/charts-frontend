# Agent Rules — Million Podcasts Frontend

## 1. Always read Next.js docs first
Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`.
Your training data is outdated — the docs are the source of truth.

## 2. Folder structure — strictly enforced
src/

├── app/                          # Routing ONLY — no business logic here

│   ├── (auth)/                   # Login, register pages

│   ├── (guest)/                  # Public pages (charts, landing, pricing, blog)

│   └── (app)/                    # Authenticated-only pages (lists, billing, account)

│

├── components/

│   ├── ui/                       # shadcn primitives — do not modify

│   └── layout/                   # Global layout: navbar, footer, logo

│

├── lib/

│   └── api.js                    # Axios instance ONLY — no feature logic here

│

├── config/                       # Static app-wide config (navigation, platforms)

│

└── features/

├── auth/

│   ├── context/              # AuthContext.jsx

│   └── services/             # authApi.js

└── charts/

├── components/           # All chart UI components

├── hooks/                # useCharts.js, useFilters.js

├── services/             # chartsApi.js

└── utils/                # normalise.js, any pure helpers

└── billing/
    ├── components/           # Pricing cards, billing status UI
    ├── hooks/                # useBillingStatus.js
    ├── services/             # billingApi.js
    └── utils/                # resolveTier.js — pure function, no imports

└── podcasts/
    ├── services/             # podcastMetaApi.js
    └── hooks/                # usePodcastMeta.js
## 3. Rules for placing new files

- New chart UI component → `src/features/charts/components/`
- New chart data hook → `src/features/charts/hooks/`
- New chart API call → `src/features/charts/services/chartsApi.js`
- New lists UI component → `src/features/lists/components/`
- New lists hook → `src/features/lists/hooks/`
- New lists API call → `src/features/lists/services/listsApi.js`
- New billing UI component → `src/features/billing/components/`
- New billing hook → `src/features/billing/hooks/`
- New billing API call → `src/features/billing/services/billingApi.js`
- Tier resolution logic (UI display only, never for access control) →
  `src/features/billing/utils/resolveTier.js`
- New podcast metadata API call → `src/features/podcasts/services/podcastMetaApi.js`
- New podcast metadata hook → `src/features/podcasts/hooks/`
- New auth UI component → `src/features/auth/components/`
- New feature entirely → `src/features/<feature-name>/` with the same sub-structure
- Global reusable UI (not feature-specific) → `src/components/ui/` or `src/components/layout/`
- New authenticated page → `src/app/(app)/<page-name>/page.jsx`
- New public page → `src/app/(guest)/<page-name>/page.jsx`
- Never create files directly inside `src/app/` except `layout.tsx` and `globals.css`
- Never add feature logic to `src/lib/api.js`

## 4. Import path conventions

- Always use `@/` alias — never relative `../../` paths
- Auth context: `@/features/auth/context/AuthContext`
- Charts API: `@/features/charts/services/chartsApi`
- Charts hooks: `@/features/charts/hooks/useCharts` etc.
- Lists API: `@/features/lists/services/listsApi`
- Billing API: `@/features/billing/services/billingApi`
- Tier resolution: `@/features/billing/utils/resolveTier`
- Podcast metadata API: `@/features/podcasts/services/podcastMetaApi`

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
- `config/charts.js` — platform list and fallbacks, not for feature logic