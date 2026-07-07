# Folder Structure Migration: bulletproof-react → mp_tools_www_v1 layout

## 0. Scope of this document (decided with the user before writing this)

Two scope questions were resolved up front — everything below is written against these decisions:

1. **Folder/file organization only.** The current stack stays exactly as-is:
   - State: React Context (`AuthContext`, `ListsCacheContext`) + TanStack React Query. **Not** switching to Redux Toolkit (which is what `mp_tools_www_v1` actually uses internally).
   - Styling: Tailwind v4 + shadcn. **Not** switching to global SCSS + Bootstrap (which is what `mp_tools_www_v1` actually uses).
   - Data fetching: keep the hooks → services (`useXxx.js` → `xxxApi.js`) pattern. **Not** switching to axios-calls-inside-components/Redux-middleware.
2. **No guest/app component duplication.** `mp_tools_www_v1` maintains two hand-copied component trees (`components/app/*` vs `components/guest/*`) that have already diverged (different `Header.jsx`, `Filters.jsx`, etc. per route). We are **not** replicating that — components stay single-implementation, branching on auth state internally where needed, same as today.

What IS changing: the **physical location of files** — moving from a per-feature vertical-slice layout (`src/features/<name>/{components,hooks,services,context,utils}`) to a per-type flat layout at the top of `src/` (`components/`, `hooks/`, `services/`, `providers/`, `utils/`, `constants/`), mirroring how `mp_tools_www_v1` organizes `src/hooks`, `src/lib`, `src/providers`, `src/reducers`, `src/constants`, `src/utils` as flat, type-based top-level folders instead of nesting them inside a feature.

**Important honesty note:** `mp_tools_www_v1` only ever built *one* feature (charts), duplicated for guest/app. It has zero precedent for how to organize multiple unrelated features (auth, billing, charts, lists, podcasts) under a type-based layout — it never had to solve that problem. So every mapping below that involves subfolders under `components/` (e.g. `components/billing/`, `components/charts/`) is **my extrapolation of the type-based principle to a multi-feature app, not something copied from an example that exists in mp_tools_www_v1.** Where I'm inferring rather than copying, I say so explicitly.

---

## 1. Principle-by-principle mapping

| `mp_tools_www_v1` convention (verified) | Current `Charts/frontend` (verified) | Target for `Charts/frontend` |
|---|---|---|
| `src/app/` = routing only, no logic | `src/app/` already routing-only (route groups `(app)`,`(auth)`,`(guest)`, pages import feature UI) | **No structural change** — only the import statements inside these files change |
| `src/components/{app,guest}/*.jsx` flat, PascalCase, no per-feature folders | `src/features/<name>/components/*.jsx` | `src/components/<domain>/*.jsx` — one subfolder per domain (extrapolated, see note above) |
| `src/components/{app,guest}/fragments/` for modals/dropdowns | nothing today — modals/dropdowns live flat inside `features/<name>/components/` | Optional `fragments/` subfolder for modal/dropdown-style components (extrapolated — see §4) |
| `src/hooks/` flat top-level (had only 1 hook, so no naming-collision precedent) | `src/features/<name>/hooks/*.js` | `src/hooks/` flat top-level — all 7 current hook names are already unique, no collisions |
| `src/lib/` narrow: store + typed store hooks only | `src/lib/` narrow: `api.js` (axios instance) + `utils.ts` (`cn()`) | **No change** — already matches the "narrow lib" principle |
| `src/reducers/` + `src/store/` (Redux-specific) | N/A (Context + Query, not Redux) | **Not adopted** — out of scope per §0 |
| `src/providers/` = app-wide provider wrapper(s) | `src/components/providers/QueryProvider.jsx` + `features/<name>/context/*.jsx` scattered | `src/providers/` — consolidate every app-wide provider (Context providers + QueryProvider) here |
| `src/constants/` = static config/data/endpoint maps | root-level `config/charts.js`, `config/navigation.js` (outside `src/`) | `src/constants/` — move both files under `src/`, matching mp_tools keeping *everything* under `src/` |
| `src/utils/` = pure helper functions | `src/features/billing/utils/resolveTier.js`, `src/features/charts/utils/normalise.js` | `src/utils/` flat top-level |
| No dedicated "services" layer (fetches happen in components/middleware) | `src/features/<name>/services/<name>Api.js` | **New top-level `src/services/`** — mp_tools has no equivalent folder for this since it doesn't use a services layer, but §0 says keep this pattern, so it just gets flattened out of `features/` the same way hooks/utils do |
| `src/components/toast/` — generic, feature-agnostic toast primitives | `components/ui/sonner.tsx` (shadcn `Toaster` wrapper) already plays this role; `features/lists/components/DeleteToast.jsx` is lists-specific undo-toast logic, not a generic primitive | **No new toast folder needed** — `DeleteToast.jsx` moves into `components/lists/` (it's feature-specific glue, not a generic primitive like mp_tools' `Toast.tsx`) |

---

## 2. Target tree

```
src/
├── app/                          # UNCHANGED — routing only
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (app)/...
│   ├── (auth)/...
│   └── (guest)/...
│
├── components/
│   ├── ui/                       # UNCHANGED — shadcn primitives, do not touch
│   ├── layout/                   # UNCHANGED — Navlinks, Footer, AuthButtons, MobileToggle, Logo, LeftLinks
│   ├── billing/
│   │   ├── BillingCard.jsx
│   │   ├── BillingSettings.jsx
│   │   ├── CancelRow.jsx
│   │   ├── ConfirmingSubscription.jsx
│   │   ├── PricingCard.jsx
│   │   └── PricingSection.jsx
│   ├── charts/
│   │   ├── ChartFilters.jsx
│   │   ├── ChartHero.jsx
│   │   ├── ChartRow.jsx
│   │   ├── ChartSection.jsx
│   │   ├── ChartTable.jsx
│   │   ├── ChartsSkeletons.jsx
│   │   ├── DynamicBreadcrumb.jsx
│   │   ├── PlatformTabs.jsx
│   │   ├── PodiumCard.jsx
│   │   └── fragments/            # optional, see §4
│   │       └── PodcastDrawer.jsx
│   ├── lists/
│   │   ├── CreateFirstList.jsx
│   │   ├── DeleteToast.jsx
│   │   ├── ListHeader.jsx
│   │   ├── ListPage.jsx
│   │   ├── ListRow.jsx
│   │   ├── ListSidebar.jsx
│   │   ├── ListSidebarItem.jsx
│   │   ├── ListsSidebarClient.jsx
│   │   └── fragments/            # optional, see §4
│   │       ├── AddToListDropdown.jsx
│   │       └── EmailExportModal.jsx
│   └── podcasts/
│       └── PodcastProfile.jsx
│
├── hooks/
│   ├── useAddToList.js
│   ├── useBillingStatus.js
│   ├── useCharts.js
│   ├── useFilters.js
│   ├── useListDetail.js
│   ├── useLists.js
│   └── usePodcastMeta.js
│
├── services/
│   ├── authApi.js
│   ├── billingApi.js
│   ├── chartsApi.js
│   ├── listsApi.js
│   └── podcastMetaApi.js
│
├── providers/
│   ├── AuthContext.jsx
│   ├── ListsCacheContext.jsx
│   └── QueryProvider.jsx
│
├── utils/
│   ├── resolveTier.js
│   └── normalise.js
│
├── constants/
│   ├── charts.js                 # was root-level config/charts.js
│   └── navigation.js             # was root-level config/navigation.js
│
└── lib/                           # UNCHANGED
    ├── api.js
    └── utils.ts

(src/features/ and the root-level config/ directory are deleted once everything above is moved)
```

---

## 3. Feature-by-feature file moves

### auth
| Current | New |
|---|---|
| `src/features/auth/context/AuthContext.jsx` | `src/providers/AuthContext.jsx` |
| `src/features/auth/services/authApi.js` | `src/services/authApi.js` |

No `components/` subfolder exists for auth today (AGENTS.md reserves `src/features/auth/components/` for future use, but it's empty) — no `components/auth/` needed unless/until an auth-specific component is added.

### billing
| Current | New |
|---|---|
| `src/features/billing/components/BillingCard.jsx` | `src/components/billing/BillingCard.jsx` |
| `src/features/billing/components/BillingSettings.jsx` | `src/components/billing/BillingSettings.jsx` |
| `src/features/billing/components/CancelRow.jsx` | `src/components/billing/CancelRow.jsx` |
| `src/features/billing/components/ConfirmingSubscription.jsx` | `src/components/billing/ConfirmingSubscription.jsx` |
| `src/features/billing/components/PricingCard.jsx` | `src/components/billing/PricingCard.jsx` |
| `src/features/billing/components/PricingSection.jsx` | `src/components/billing/PricingSection.jsx` |
| `src/features/billing/hooks/useBillingStatus.js` | `src/hooks/useBillingStatus.js` |
| `src/features/billing/services/billingApi.js` | `src/services/billingApi.js` |
| `src/features/billing/utils/resolveTier.js` | `src/utils/resolveTier.js` |

### charts
| Current | New |
|---|---|
| `src/features/charts/components/ChartFilters.jsx` | `src/components/charts/ChartFilters.jsx` |
| `src/features/charts/components/ChartHero.jsx` | `src/components/charts/ChartHero.jsx` |
| `src/features/charts/components/ChartRow.jsx` | `src/components/charts/ChartRow.jsx` |
| `src/features/charts/components/ChartSection.jsx` | `src/components/charts/ChartSection.jsx` |
| `src/features/charts/components/ChartTable.jsx` | `src/components/charts/ChartTable.jsx` |
| `src/features/charts/components/ChartsSkeletons.jsx` | `src/components/charts/ChartsSkeletons.jsx` |
| `src/features/charts/components/DynamicBreadcrumb.jsx` | `src/components/charts/DynamicBreadcrumb.jsx` |
| `src/features/charts/components/PlatformTabs.jsx` | `src/components/charts/PlatformTabs.jsx` |
| `src/features/charts/components/PodcastDrawer.jsx` | `src/components/charts/fragments/PodcastDrawer.jsx` (or flat `components/charts/PodcastDrawer.jsx` — see §4) |
| `src/features/charts/components/PodiumCard.jsx` | `src/components/charts/PodiumCard.jsx` |
| `src/features/charts/hooks/useCharts.js` | `src/hooks/useCharts.js` |
| `src/features/charts/hooks/useFilters.js` | `src/hooks/useFilters.js` |
| `src/features/charts/services/chartsApi.js` | `src/services/chartsApi.js` |
| `src/features/charts/utils/normalise.js` | `src/utils/normalise.js` |

⚠️ **Existing cross-feature coupling, discovered while tracing imports (not something the migration creates):** `charts` and `lists` already import from each other — `ChartRow.jsx`/`ChartTable.jsx`/`PodiumCard.jsx` import `AddToListDropdown` from `lists`, and `lists/ListRow.jsx` imports `ChartRowCard` from `charts`. This is a pre-existing circular feature dependency in the bulletproof-react structure (arguably a violation of feature isolation already). The flat layout doesn't fix or worsen this — just flagging it so it isn't mistaken for something the migration broke.

### lists
| Current | New |
|---|---|
| `src/features/lists/components/AddToListDropdown.jsx` | `src/components/lists/fragments/AddToListDropdown.jsx` (or flat — see §4) |
| `src/features/lists/components/CreateFirstList.jsx` | `src/components/lists/CreateFirstList.jsx` |
| `src/features/lists/components/DeleteToast.jsx` | `src/components/lists/DeleteToast.jsx` |
| `src/features/lists/components/EmailExportModal.jsx` | `src/components/lists/fragments/EmailExportModal.jsx` (or flat — see §4) |
| `src/features/lists/components/ListHeader.jsx` | `src/components/lists/ListHeader.jsx` |
| `src/features/lists/components/ListPage.jsx` | `src/components/lists/ListPage.jsx` |
| `src/features/lists/components/ListRow.jsx` | `src/components/lists/ListRow.jsx` |
| `src/features/lists/components/ListSidebar.jsx` | `src/components/lists/ListSidebar.jsx` |
| `src/features/lists/components/ListSidebarItem.jsx` | `src/components/lists/ListSidebarItem.jsx` |
| `src/features/lists/components/ListsSidebarClient.jsx` | `src/components/lists/ListsSidebarClient.jsx` |
| `src/features/lists/context/ListsCacheContext.jsx` | `src/providers/ListsCacheContext.jsx` |
| `src/features/lists/hooks/useAddToList.js` | `src/hooks/useAddToList.js` |
| `src/features/lists/hooks/useListDetail.js` | `src/hooks/useListDetail.js` |
| `src/features/lists/hooks/useLists.js` | `src/hooks/useLists.js` |
| `src/features/lists/services/listsApi.js` | `src/services/listsApi.js` |

### podcasts
| Current | New |
|---|---|
| `src/features/podcasts/components/PodcastProfile.jsx` | `src/components/podcasts/PodcastProfile.jsx` |
| `src/features/podcasts/hooks/usePodcastMeta.js` | `src/hooks/usePodcastMeta.js` |
| `src/features/podcasts/services/podcastMetaApi.js` | `src/services/podcastMetaApi.js` |

### Shared / infra (not under `features/` today, but also moving)
| Current | New |
|---|---|
| `src/components/providers/QueryProvider.jsx` | `src/providers/QueryProvider.jsx` |
| `config/charts.js` (repo root, outside `src/`) | `src/constants/charts.js` |
| `config/navigation.js` (repo root, outside `src/`) | `src/constants/navigation.js` |

**Not moving:** `src/components/ui/*` (shadcn — untouched), `src/components/layout/*` (already correctly shared, not feature-specific), `src/lib/api.js`, `src/lib/utils.ts`, everything in `src/app/`.

---

## 4. The one open call: flat vs. `fragments/` for modals & dropdowns

`mp_tools_www_v1` nests modal/dropdown-style components in a `fragments/` subfolder inside each of `components/app/` and `components/guest/` (e.g. `AddToListModal.jsx`, `SearchableDropdown.jsx`, `UserMenu.jsx`). Since this project only has one domain-per-mode, I can't confirm whether that convention was meant to generalize to a multi-domain `components/<domain>/` layout — it might just as easily be "this file happens to render as an overlay" bucketing, done once, at the only scale mp_tools ever operated at (a single feature).

Two reasonable options, both equally faithful to the underlying principle:

- **Flat** (simplest): `AddToListDropdown.jsx`, `EmailExportModal.jsx`, `PodcastDrawer.jsx` stay directly in `components/lists/` and `components/charts/` alongside everything else.
- **fragments/ subfolder** (closer visual mirror of mp_tools): same three files, nested one level under `components/lists/fragments/` and `components/charts/fragments/`.

I'd default to **flat** — with only 2-3 modal-ish files per domain there's no organizational payoff yet, and it avoids introducing a subfolder split mp_tools itself never actually validated beyond a single feature. But this is a low-stakes, easily-reversible choice — say the word if you'd rather mirror `fragments/` exactly, and I'll use that in the move script.

---

## 5. Complete import-path rewrite table

Every `@/features/...` (or relative) import in the codebase today, and what it becomes. This was generated from an exhaustive `grep` across `src/`, not from memory — every hit found is listed.

| Old import path | New import path | Used in (file) |
|---|---|---|
| `@/features/auth/context/AuthContext` | `@/providers/AuthContext` | `app/layout.tsx`, `app/(auth)/login/page.jsx`, `app/(auth)/register/page.jsx`, `components/layout/MobileToggle.jsx`, `components/layout/AuthButtons.jsx`, `components/billing/BillingSettings.jsx`, `components/billing/ConfirmingSubscription.jsx`, `components/billing/PricingSection.jsx`, `components/lists/AddToListDropdown.jsx` (or `fragments/AddToListDropdown.jsx`), `components/lists/EmailExportModal.jsx` (or `fragments/...`), `components/charts/ChartTable.jsx`, `components/charts/PodcastDrawer.jsx`, `providers/ListsCacheContext.jsx` |
| `@/features/auth/services/authApi` | `@/services/authApi` | `providers/AuthContext.jsx` |
| `@/features/billing/components/BillingCard` | `@/components/billing/BillingCard` | `components/billing/BillingSettings.jsx` |
| `@/features/billing/components/CancelRow` | `@/components/billing/CancelRow` | `components/billing/BillingSettings.jsx` |
| `@/features/billing/hooks/useBillingStatus` | `@/hooks/useBillingStatus` | `components/billing/BillingSettings.jsx` |
| `@/features/billing/services/billingApi` | `@/services/billingApi` | `components/billing/BillingSettings.jsx`, `components/billing/ConfirmingSubscription.jsx`, `components/billing/PricingSection.jsx`, `hooks/useBillingStatus.js` |
| `@/features/billing/utils/resolveTier` | `@/utils/resolveTier` | `components/layout/AuthButtons.jsx`, `components/billing/PricingSection.jsx`, `components/charts/PodcastDrawer.jsx` |
| `@/features/charts/components/ChartRow` | `@/components/charts/ChartRow` | `components/podcasts/PodcastProfile.jsx` (named import `RankMoveBadge`), `components/lists/ListRow.jsx` (named import `ChartRowCard`) |
| `@/features/charts/components/ChartSection` | `@/components/charts/ChartSection` | `app/(guest)/charts/[[...slug]]/page.jsx` |
| `@/features/charts/hooks/useCharts` | `@/hooks/useCharts` | `components/charts/ChartSection.jsx` |
| `@/features/charts/hooks/useFilters` | `@/hooks/useFilters` | `components/charts/ChartHero.jsx` |
| `@/features/charts/services/chartsApi` | `@/services/chartsApi` | `hooks/useCharts.js`, `hooks/useFilters.js` |
| `@/features/charts/utils/normalise` | `@/utils/normalise` | `components/podcasts/PodcastProfile.jsx` (named import `getFlagEmoji`), `components/charts/ChartFilters.jsx` |
| `@/features/lists/components/AddToListDropdown` | `@/components/lists/AddToListDropdown` (or `.../fragments/AddToListDropdown`) | `components/charts/ChartRow.jsx`, `components/charts/ChartTable.jsx`, `components/charts/PodiumCard.jsx` |
| `@/features/lists/components/CreateFirstList` | `@/components/lists/CreateFirstList` | `app/(app)/lists/(hero)/page.jsx` |
| `@/features/lists/components/ListHeader` | `@/components/lists/ListHeader` | `app/(guest)/lists/shared/[token]/page.jsx` |
| `@/features/lists/components/ListPage` | `@/components/lists/ListPage` | `app/(app)/lists/[id]/page.jsx` |
| `@/features/lists/components/ListRow` | `@/components/lists/ListRow` | `app/(guest)/lists/shared/[token]/page.jsx` |
| `@/features/lists/components/ListSidebar` | `@/components/lists/ListSidebar` | `components/lists/ListsSidebarClient.jsx` |
| `@/features/lists/components/ListsSidebarClient` | `@/components/lists/ListsSidebarClient` | `app/(app)/lists/[id]/page.jsx` |
| `@/features/lists/context/ListsCacheContext` | `@/providers/ListsCacheContext` | `app/layout.tsx`, `hooks/useLists.js`, `hooks/useAddToList.js` |
| `@/features/lists/hooks/useAddToList` | `@/hooks/useAddToList` | `components/lists/AddToListDropdown.jsx` |
| `@/features/lists/hooks/useListDetail` | `@/hooks/useListDetail` | `components/lists/ListPage.jsx` |
| `@/features/lists/hooks/useLists` | `@/hooks/useLists` | `components/lists/ListsSidebarClient.jsx` |
| `@/features/lists/services/listsApi` | `@/services/listsApi` | `providers/ListsCacheContext.jsx`, `components/lists/CreateFirstList.jsx`, `hooks/useListDetail.js`, `hooks/useLists.js`, `components/lists/EmailExportModal.jsx`, `hooks/useAddToList.js`, `components/lists/ListHeader.jsx`, `components/lists/ListPage.jsx` |
| `@/features/podcasts/components/PodcastProfile` | `@/components/podcasts/PodcastProfile` | `app/(guest)/podcasts/[id]/page.jsx` |
| `@/features/podcasts/hooks/usePodcastMeta` | `@/hooks/usePodcastMeta` | `components/podcasts/PodcastProfile.jsx`, `components/charts/PodcastDrawer.jsx` |
| `@/features/podcasts/services/podcastMetaApi` | `@/services/podcastMetaApi` | `hooks/usePodcastMeta.js` |
| `@/features/billing/components/PricingSection` | `@/components/billing/PricingSection` | `app/(guest)/pricing/page.jsx` |
| `@/features/billing/components/BillingSettings` | `@/components/billing/BillingSettings` | `app/(app)/billing/page.jsx` |
| `@/features/billing/components/ConfirmingSubscription` | `@/components/billing/ConfirmingSubscription` | `app/(app)/billing/confirming/page.jsx` |
| `@/components/providers/QueryProvider` | `@/providers/QueryProvider` | `app/layout.tsx` |
| `../../../config/navigation` (relative) | `@/constants/navigation` | `components/layout/Navlinks.jsx`, `components/layout/MobileToggle.jsx`, `components/layout/Footer.jsx` |
| `../../../../../config/charts` (relative) | `@/constants/charts` | `app/(guest)/charts/[[...slug]]/page.jsx` |
| `../../../../config/charts` (relative) | `@/constants/charts` | `components/charts/PlatformTabs.jsx` |

**Files not appearing above but that move anyway (same-folder relative imports, unaffected):** `PricingCard.jsx` (imported by `PricingSection.jsx` via a relative `./PricingCard`-style path, not `@/`), `PodcastDrawer.jsx` and `EmailExportModal.jsx`'s own internal usages — these keep working automatically as long as the files that reference each other move together into the same new folder, since their import is relative, not aliased.

**Bonus from this move:** the `config/*` imports switch from fragile relative paths (`../../../../../config/charts`, five levels deep) to the flat `@/constants/charts` alias — a real improvement, not just parity.

---

## 6. Recommended execution order

No test suite exists (`package.json` only has `dev`/`build`/`start`/`lint`), so "verify" below means: `yarn lint` passes, `yarn build` succeeds, and you manually click through the affected routes in `yarn dev`.

1. **Warm-up (single file, single import site):** move `components/providers/QueryProvider.jsx` → `providers/QueryProvider.jsx`; fix the one import in `app/layout.tsx`. Verify: app boots.
2. **`config/` → `constants/`:** move both files, update the 5 relative-import sites to `@/constants/...`. Verify: nav/footer render, `/charts` page loads (uses `platforms`).
3. **`auth`** (highest fan-in — 13 files import it, so moving it first means every other feature you touch afterward already points at the final path instead of needing a second edit): move `AuthContext.jsx` → `providers/`, `authApi.js` → `services/`. Update all 13 import sites per §5. Verify: login/register/logout still work.
4. **`podcasts`** (fewest cross-feature dependents): move `PodcastProfile.jsx` → `components/podcasts/`, `usePodcastMeta.js` → `hooks/`, `podcastMetaApi.js` → `services/`. Verify: `/podcasts/[id]` loads.
5. **`billing`**: move all 6 components → `components/billing/`, hook → `hooks/`, service → `services/`, `resolveTier.js` → `utils/`. Verify: `/pricing`, `/billing`, `/billing/confirming` load; `AuthButtons.jsx`'s tier badge still renders.
6. **`lists` + `charts` together** (these two already import from each other — see the circular-dependency note in §3 — so move them in the same pass to avoid a broken intermediate state): move all `lists/*` and `charts/*` files per the tables in §3, update every import in §5 touching either feature. Verify: `/charts/[...]`, `/lists`, `/lists/[id]`, `/lists/shared/[token]` all load; "add to list" dropdown from a chart row still works (this is the actual cross-feature wire, worth clicking through by hand).
7. **Delete** the now-empty `src/features/` tree and the root-level `config/` directory.
8. **Update `AGENTS.md` / `CLAUDE.md`** — see §7. This is not optional cleanup: the current file actively documents the old structure as "strictly enforced" (section 2) and tells future work — including future AI-assisted edits — to keep creating `src/features/<name>/...` files (section 3). Leaving it stale will actively steer the next change back into the old layout.
9. **Final pass:** `yarn lint`, `yarn build`, then manually visit every route once more.

---

## 7. `AGENTS.md` / `CLAUDE.md` — what needs to change

The current file (read in full — see quoted rules below) hard-codes the feature-folder structure as law. After the move, at minimum these sections need rewriting to match the new tree:

- **Section 2 ("Folder structure — strictly enforced")** — currently describes `src/features/{auth,charts,billing,podcasts}/...`. Needs to describe the new `components/<domain>/`, `hooks/`, `services/`, `providers/`, `utils/`, `constants/` layout from §2 of this doc instead.
- **Section 3 ("Rules for placing new files")** — every line currently says `src/features/<name>/...`; each needs updating to the new target folder (e.g. "New chart UI component → `src/components/charts/`", "New chart data hook → `src/hooks/`", "New chart API call → `src/services/chartsApi.js`").
- **Section 4 ("Import path conventions")** — the example paths (`@/features/auth/context/AuthContext`, `@/features/charts/services/chartsApi`, etc.) all need updating to the new `@/providers/...`, `@/services/...` paths.
- **Section 5 ("Auth pattern")** and **Section 6 ("Component conventions")** — unaffected by this move, no changes needed.
- **Section 7 ("Do not touch")** — `config/charts.js` reference should become `src/constants/charts.js`.

I have not rewritten this file for you yet since the flat-vs-fragments call in §4 isn't finalized — once you confirm that, I can produce the exact replacement text so the doc and the tree agree from the first commit after the move.

---

## 8. Anything I'm NOT confident enough to state as fact

To keep this honest: I have not personally opened and read every single line of every file listed above (e.g. `PricingCard.jsx`, `ListSidebarItem.jsx`, `ChartsSkeletons.jsx`, `DynamicBreadcrumb.jsx`) — their existence, folder, and file extension are confirmed via directory listing, but their *internal* import statements were only checked where they showed up in the exhaustive `@/features` grep in §5. If any of those files contain a relative import I didn't catch (e.g. `../../../lib/api` reaching outside their own feature folder), it would still resolve correctly after the move as long as the relative-path depth is recalculated for the new location — worth a quick visual scan of each file's import block during the actual move, not just a find-and-replace on `@/features`.
