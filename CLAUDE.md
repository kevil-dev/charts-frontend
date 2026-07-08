# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
yarn dev        # Start dev server (Turbopack, localhost:3000)
yarn build      # Production build
yarn lint       # ESLint
```

No test suite is configured. There is no `yarn test` command.

## Environment

Two `.env.local` variables control API routing:

| Variable | Value | Used by |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `/api` | Axios instance (`src/lib/api.js`) — client-side, relative so cookies are same-origin |
| `INTERNAL_API_URL` | `http://127.0.0.1:8000` | Server components and server actions — bypasses the rewrite proxy for direct PHP calls |

The Next.js rewrite proxy in `next.config.ts` forwards `localhost:3000/api/*` → `http://127.0.0.1:8000/*`. This is what makes the `mp_token` httpOnly cookie land on `localhost:3000` so server components can read it.

**Critical rule:** Server-side `fetch()` calls (page.jsx, layout.jsx, server actions) must always use `INTERNAL_API_URL`. Node.js cannot resolve the relative `/api` path.

## Architecture

### Data flow — public chart pages

`page.jsx` (server) → fetches meta + chart data via `INTERNAL_API_URL` → renders a `ChartStoreSeeder` client component that dispatches `chartsApi.util.upsertQueryData("getCharts", ...)` on mount → `ChartSection` (client) calls `useGetChartsQuery` → finds the pre-seeded RTK Query cache entry → no client fetch on first render. Billing's `page.jsx` follows the same pattern via `BillingStoreSeeder` + `billingApi.util.upsertQueryData("getBillingStatus", ...)`.

`fetchMeta` and `fetchCharts` in the charts page are wrapped with React `cache()` so `generateMetadata` and `ChartPage` share one fetch per request.

### Data flow — authenticated pages

`(app)/layout.jsx` calls `/auth/me` server-side on every request. If the response is not `ok`, it redirects to `/login`. Individual pages inside `(app)/` don't need their own auth guard.

The root `layout.tsx` calls `getServerUser()` and passes the result as `initialUser` to `StoreProvider`, which seeds the Redux `auth` slice via `configureStore`'s `preloadedState` (`{ user: initialUser, isLoading: !initialUser }`) — so `isLoading` is already `false` on first render when the server resolved a user, with no navbar flash. If no `initialUser` was resolved, `StoreProvider` dispatches the `fetchUser` thunk on mount to check the cookie client-side.

### API layer

`src/lib/api.js` is an Axios instance only. Its response interceptor unwraps `response.data.data` so service functions return the payload directly (not the full Axios response). Errors are normalised to `{ message, status, code }`.

`authApi.js` is a plain service that calls the Axios instance directly — it's only used inside `src/store/authSlice.js`'s thunks, not from components. Every other feature (`charts`, `lists`, `billing`, `podcasts`) is an RTK Query slice (`src/services/*ApiSlice.js`) whose `baseQuery` is `axiosBaseQuery` (`src/lib/api.js`), so the same Axios instance still backs every request. `src/lib/api.js` itself should only be imported from `authApi.js` and `axiosBaseQuery.js`.

### Redux Toolkit + RTK Query

State management is Redux Toolkit — there is no TanStack Query or React Context for server/auth state in this codebase.

- **Store**: `src/store/store.ts` exports `makeStore()` (accepts an optional `preloadedState`) plus the `AppStore`/`RootState`/`AppDispatch` types. `src/store/hooks.js` exports `useAppDispatch`/`useAppSelector`. A fresh store is created per client tree via `useState(() => makeStore(...))` inside `StoreProvider` — never a module-level singleton — so state can't leak across requests.
- **Auth**: `src/store/authSlice.js` is a `createSlice` + `createAsyncThunk` slice (not an RTK Query API slice) — it owns `user`/`isLoading` and exposes the `fetchUser`, `login`, `logout`, `register`, `loginWithGoogle` thunks plus `selectUser`/`selectAuthLoading` selectors.
- **Provider tree**: `src/providers/StoreProvider.jsx` is the only provider — it wraps `<Provider store={...}>` from react-redux. There is no `QueryProvider` or `AuthProvider`.
- **API slices**: each feature has one `createApi` slice in `src/services/*ApiSlice.js` (`chartsApiSlice.js`, `listsApiSlice.js`, `billingApiSlice.js`, `podcastApiSlice.js`), each wired into `store.ts`'s reducer map and middleware chain. Components import the slice's generated hooks directly (`useGetChartsQuery`, `useCreateListMutation`, etc.) — there are no hand-written data hooks in `src/hooks/`.
- **SSR seeding**: pages that need to avoid a duplicate client-side fetch on first paint render a small `"use client"` `*StoreSeeder` component (e.g. `ChartStoreSeeder.jsx`, `BillingStoreSeeder.jsx`) that dispatches `<slice>.util.upsertQueryData(endpointName, arg, serverFetchedData)` in a mount-only `useEffect`. This replaces the old TanStack `HydrationBoundary`/`dehydrate` pattern.

### Tailwind v4

Dynamic class strings (`size-${n}`) are stripped at build time. Use static lookup maps — see `SIZE_CLASSES` in `ChartRow.jsx` as the pattern to follow.
