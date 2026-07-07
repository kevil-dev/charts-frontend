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

`page.jsx` (server) → fetches meta + chart data via `INTERNAL_API_URL` → seeds TanStack Query via `HydrationBoundary` → `ChartSection` (client) calls `useCharts` → finds pre-seeded data in cache → no client fetch on first render.

`fetchMeta` and `fetchCharts` in the charts page are wrapped with React `cache()` so `generateMetadata` and `ChartPage` share one fetch per request.

### Data flow — authenticated pages

`(app)/layout.jsx` calls `/auth/me` server-side on every request. If the response is not `ok`, it redirects to `/login`. Individual pages inside `(app)/` don't need their own auth guard.

The root `layout.tsx` also calls `getServerUser()` and passes the result as `initialUser` to `AuthProvider`, so `AuthContext` starts with `isLoading: false` and the correct user — no navbar flash.

### API layer

`src/lib/api.js` is an Axios instance only. Its response interceptor unwraps `response.data.data` so service functions return the payload directly (not the full Axios response). Errors are normalised to `{ message, status, code }`.

Feature services (`chartsApi`, `listsApi`, `authApi`) call the Axios instance. They are the only place that should import from `@/lib/api`.

### TanStack Query

`QueryProvider` wraps the app in `src/providers/QueryProvider.jsx`. Chart data uses `useCharts` hook with query key `["charts", platform, country, category, page]`. The server pre-seeds this key via `HydrationBoundary` in the charts page.

### Tailwind v4

Dynamic class strings (`size-${n}`) are stripped at build time. Use static lookup maps — see `SIZE_CLASSES` in `ChartRow.jsx` as the pattern to follow.
