# RTK Query Research Notes

Reference notes gathered from official Redux Toolkit docs (redux-toolkit.js.org) and
supporting sources, for use during the TanStack Query → RTK Query migration. No source
files were changed while producing this document.

Context for this project (from `frontend/CLAUDE.md` / `frontend/AGENTS.md`):
- Currently on `@tanstack/react-query` v5 + a plain axios instance (`src/lib/api.js`,
  `withCredentials: true`, response interceptor unwraps `response.data.data`, errors
  normalized to `{ message, status, code }`).
- Auth uses an httpOnly `mp_token` cookie set by the PHP backend — never read/write it
  from JS, never attach `Authorization` headers manually.
- Server components already fetch server-side via `INTERNAL_API_URL` and seed the
  client cache (currently via TanStack's `HydrationBoundary`). RTK Query's SSR story
  (below) is the analogous mechanism if we keep server-side prefetching.

---

## 1. createApi and endpoint patterns (queries vs mutations)

`createApi` is the single entry point for RTK Query. It generates an "API slice": a
reducer + middleware + (with the React version) auto-generated hooks.

- Import from `@reduxjs/toolkit/query` for the vanilla version, or
  `@reduxjs/toolkit/query/react` to get auto-generated React hooks.
- **Rule of thumb: one API slice per base URL.** Since this project has a single PHP
  backend behind `/api`, that means one `createApi` call, with endpoints split by
  feature (charts, lists, billing, auth) if desired via `injectEndpoints`.

```javascript
export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
  endpoints: (build) => ({
    getPokemonByName: build.query({
      query: (name) => `pokemon/${name}`,
    }),
  }),
})
```

Endpoints are defined via the `build.query` (read, cacheable, GET-like) and
`build.mutation` (write, triggers cache invalidation) builders inside the `endpoints`
callback.

Store wiring requires both the reducer and the middleware:

```javascript
configureStore({
  reducer: { [pokemonApi.reducerPath]: pokemonApi.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pokemonApi.middleware),
})
```

`setupListeners(store.dispatch)` enables `refetchOnMount` / `refetchOnFocus` /
`refetchOnReconnect` behavior (the RTK Query analogue of TanStack Query's
`refetchOnWindowFocus`).

Auto-generated hooks follow the pattern `use<EndpointName>Query` / `use<EndpointName>Mutation`,
returning `{ data, error, isLoading, isFetching, ... }` — conceptually equivalent to
TanStack Query's `useQuery`/`useMutation` return shape, so hook call sites in
components should port over with minimal shape changes.

Sources:
- https://redux-toolkit.js.org/rtk-query/overview
- https://redux-toolkit.js.org/rtk-query/api/createApi
- https://redux-toolkit.js.org/rtk-query/usage/queries
- https://redux-toolkit.js.org/rtk-query/usage/mutations

---

## 2. baseQuery — axiosBaseQuery exact pattern

`fetchBaseQuery` (a thin wrapper over `fetch`) is the default/recommended baseQuery
for most apps. **We will not use it** — this project already standardizes all HTTP
traffic through the shared axios instance in `src/lib/api.js` (interceptors, cookie
credentials, error normalization), and `AGENTS.md` forbids introducing a second HTTP
client. The official docs explicitly document swapping in axios via a custom
`baseQuery`.

Official pattern from *Customizing Queries*:

```typescript
const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      })
      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }

const api = createApi({
  baseQuery: axiosBaseQuery({ baseUrl: 'https://example.com' }),
  endpoints(build) {
    return {
      query: build.query({ query: () => ({ url: '/query', method: 'get' }) }),
      mutation: build.mutation({ query: () => ({ url: '/mutation', method: 'post' }) }),
    }
  },
})
```

**Hard rule from the docs:** a `baseQuery` (and any `queryFn`) must *always* catch its
own errors and return them in `{ error }` — never throw. This matches what
`src/lib/api.js`'s interceptor already does (normalizes to `{ message, status, code }`),
so the migration's `axiosBaseQuery` should call the *existing* configured axios
instance (import from `@/lib/api`) rather than the bare `axios` package, to keep
`withCredentials` and the interceptor behavior. Concretely:

```javascript
import api from '@/lib/api' // existing configured axios instance

const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }) => {
    try {
      const result = await api({ url, method, data, params })
      return { data: result } // api.js interceptor already unwraps response.data.data
    } catch (err) {
      return { error: { status: err.status, message: err.message, code: err.code } }
    }
  }
```

(Field shape above is adapted to this project's existing error normalization; verify
against `src/lib/api.js` exactly during implementation — not confirmed by the RTK docs
themselves, which assume a raw `AxiosError`.)

Other notes from the docs:
- Request cancellation: RTK Query aborts in-flight requests via `AbortController`;
  pass `signal: api.signal` into the axios call if we want cancellation to propagate.
- `prepareHeaders` (used with `fetchBaseQuery`) doesn't apply directly to a custom
  axios baseQuery — header injection there is just part of the axios instance's own
  config/interceptors, which already exist in this codebase.

Sources:
- https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#axios-basequery
- https://gist.github.com/ankit-kumar-jat/a6e02fb0ddc4d50473eefbcb8607668b (community example, cross-checked against official pattern)

---

## 3. Tag types and invalidation rules

- `tagTypes: string[]` declared on `createApi` lists every possible tag name.
- A tag is `'TypeName'` (general) or `{ type: 'TypeName', id }` (specific), where `id`
  is a string or number.
- `providesTags` on a **query** endpoint marks what cached data represents. Accepts an
  array or a `(result, error, arg) => tags[]` callback.
- `invalidatesTags` on a **mutation** endpoint marks what to invalidate/refetch on
  success. Same array-or-callback shape.

**Invalidation matching rule:** invalidating a general tag (`'Post'`) invalidates
every provided tag of that type, general or specific. Invalidating a specific tag
(`{ type: 'Post', id: 1 }`) only invalidates matching type+id — it does **not**
cascade to invalidate the general tag directly (though it can still trigger a refetch
of any endpoint that also separately provides that general tag).

**LIST id pattern** — for "get many" + "add one" endpoints, avoid refetching every
individual cached item when a new one is added:

```javascript
getPosts: build.query({
  query: () => '/posts',
  providesTags: (result) =>
    result
      ? [...result.map(({ id }) => ({ type: 'Posts', id })), { type: 'Posts', id: 'LIST' }]
      : [{ type: 'Posts', id: 'LIST' }],
}),
addPost: build.mutation({
  query: (body) => ({ url: '/posts', method: 'POST', body }),
  invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
}),
```

Function-form example (mixing a general fallback tag with per-item tags):

```javascript
providesTags: (result, error, arg) =>
  result
    ? [...result.map(({ id }) => ({ type: 'Post', id })), 'Post']
    : ['Post']

invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.id }]
```

Since RTK 2.x, tag invalidation has an `invalidationBehavior` setting on `createApi`:
`'delayed'` (default — batches multiple invalidations from the same dispatch tick
together) vs `'immediately'` (pre-2.0 behavior). Shouldn't need to touch this unless
we hit a specific ordering bug.

Sources:
- https://redux-toolkit.js.org/rtk-query/usage/automated-refetching

---

## 4. Optimistic updates — onQueryStarted exact pattern

Every query/mutation endpoint can define an `onQueryStarted(arg, api)` lifecycle
callback, fired as soon as the request starts. `api` includes `dispatch`,
`getState`, and `queryFulfilled` (a promise that resolves/rejects like the request).

Canonical optimistic-update pattern (official docs, `updatePost` mutation optimistically
patches the `getPost` query cache, and rolls back on failure):

```typescript
updatePost: build.mutation<void, Pick<Post, 'id'> & Partial<Post>>({
  query: ({ id, ...patch }) => ({
    url: `post/${id}`,
    method: 'PATCH',
    body: patch,
  }),
  async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      api.util.updateQueryData('getPost', id, (draft) => {
        Object.assign(draft, patch)
      }),
    )
    try {
      await queryFulfilled
    } catch {
      patchResult.undo()
    }
  },
}),
```

Key points:
- `api.util.updateQueryData(endpointName, queryArg, recipe)` uses Immer under the hood
  — mutate `draft` directly, don't return a new object.
- The dispatch call returns a `patchResult` object with `.undo()` — call it inside a
  `catch` around `await queryFulfilled` to roll back on server failure. No manual
  snapshot/restore bookkeeping needed (unlike the manual "save old value, setQueryData
  on error" pattern from TanStack Query).
- This is the direct replacement for TanStack Query's `onMutate` (snapshot + optimistic
  `setQueryData`) / `onError` (rollback) / `onSettled` (invalidate) trio — RTK Query
  collapses all three into one `onQueryStarted`.

Sources:
- https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates#optimistic-updates
- https://redux.js.org/tutorials/essentials/part-8-rtk-query-advanced

---

## 5. SSR with Next.js App Router — upsertQueryData approach

The official docs' SSR guidance (`server-side-rendering.mdx`) is written for the
**Pages Router** + `next-redux-wrapper`, using `HYDRATE`-action rehydration via
`extractRehydrationInfo`. That pattern does not map cleanly onto the App Router.

**For App Router specifically** (per community discussion, since official docs don't
yet cover this natively): the recommended shape is —
1. Fetch data server-side in a Server Component using plain `fetch`/`INTERNAL_API_URL`
   (as this project already does) — RTK Query itself is documented as "client-side
   data fetching only" in this context; server-side fetching should stay as
   plain `fetch` from RSCs, not through RTK Query.
2. Pass that server-fetched data down as a prop to a Client Component.
3. In the Client Component (e.g. inside a `useEffect` or on mount), dispatch
   `store.dispatch(api.util.upsertQueryData(endpointName, arg, data))` to seed the
   RTK Query cache with the server-fetched payload *before* any `use<Endpoint>Query`
   hook call for the same cache key fires its own network request.
4. Subsequent renders read from cache like any other RTK Query-backed component; no
   duplicate client-side fetch on first paint.

This is the closest RTK Query analogue to today's `HydrationBoundary` + prefetched
`queryClient` approach from TanStack Query, but note the mechanics differ: TanStack's
`HydrationBoundary` serializes the whole query cache across the server/client boundary
declaratively; RTK Query's `upsertQueryData` is an imperative dispatch that must run
client-side (there's no built-in serialize-on-server / hydrate-on-client helper for
the App Router as of the current docs).

Caveats found:
- No first-class "seed from RSC" API exists yet — an RTK maintainer discussion
  (GitHub #4251) says direct RSC → RTK Query cache seeding may arrive in the future
  but requires further React/RTK changes; treat `upsertQueryData` as the current
  workaround, not a documented long-term API.
- There's also an experimental/`unstable__` `sideEffectsInRender` flag on
  `buildCreateApi` for non-Next SSR frameworks (Apollo-`getDataFromTree`-style) — not
  relevant to Next.js and marked unstable; do not use.
- If we do go down the `next-redux-wrapper` + `HYDRATE` route instead (full Pages
  Router-style SSR retrofitted onto Route Handlers), remember to call
  `store.dispatch(api.util.resetApiState())` after render to avoid leaking
  polling/subscription timers on the server.

Sources:
- https://redux-toolkit.js.org/rtk-query/usage/server-side-rendering
- https://github.com/reduxjs/redux-toolkit/discussions/4251
- https://github.com/reduxjs/redux-toolkit/issues/3585

---

## 6. Auth slice — createSlice + createAsyncThunk pattern

Standard shape combines a plain `createSlice` for UI-facing auth state with
`createAsyncThunk` for the async login/logout/fetch-me calls, wired together via the
**builder callback** form of `extraReducers` (the object-map form is removed in RTK 2.x
— see gotchas below).

```javascript
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.me()
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {
    loggedOut(state) {
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error
      })
  },
})
```

- `createAsyncThunk('auth/fetchCurrentUser', payloadCreator)` auto-generates three
  action types: `auth/fetchCurrentUser/pending|fulfilled|rejected`.
- `rejectWithValue(customError)` lets the `rejected` case carry a typed/custom
  `action.payload` instead of the generic thrown error — use this to surface the
  normalized `{ message, status, code }` shape from `src/lib/api.js`.
- Component-side: `await dispatch(fetchCurrentUser()).unwrap()` throws on rejection
  and returns the payload directly on success — cleaner than manually checking
  `action.type.endsWith('/rejected')`.
- **Given this project's auth model** (httpOnly cookie set by the backend, `user`
  object mirrored into `AuthContext` from a server-side `getServerUser()` call): if we
  introduce Redux at all, the auth slice should hold only the non-sensitive `user`
  display object and loading/error status — never a token. This mirrors the existing
  `AuthContext` constraint in `AGENTS.md` and should carry over unchanged if
  `AuthContext` is replaced by a Redux slice.
- Whether an auth *slice* is even needed alongside RTK Query is worth revisiting: RTK
  Query's own `getMe` query (with cache tags) can often replace a hand-rolled auth
  thunk/slice entirely, since "is the user logged in" is itself just server data. Flag
  this as a design decision for the migration plan rather than assuming both are
  needed.

Sources:
- https://redux-toolkit.js.org/api/createAsyncThunk
- https://redux-toolkit.js.org/api/createSlice
- https://blog.logrocket.com/handling-user-authentication-redux-toolkit/ (community, cross-checked against official API docs)

---

## 7. Version-specific gotchas (RTK 2.x vs 1.x)

Current stable major is RTK 2.x (Redux core 5.0, Reselect 5.0, Redux Thunk 3.0,
React-Redux 9.0 peer). Given this project is on React 19 / Next 16, RTK 2.x is the
only viable target (React-Redux 9 requires React 18+; RTK 1.x tooling predates React
19 support).

Breaking / notable changes vs 1.x that matter for this migration:

- **`extraReducers` object-map syntax removed.** Must use the builder callback form
  (`(builder) => builder.addCase(...)`) shown above — the old
  `extraReducers: { [thunk.fulfilled]: ... }` shape throws/no longer type-checks.
- **`configureStore({ middleware })` must be a callback**, not a bare array:
  `middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)`.
  Same for `enhancers`. If `middleware` and `enhancers` are both passed, `middleware`
  must be listed first for TS inference to work.
- **`reactHooksModule` custom-hooks config changed shape** — `useDispatch`/`useSelector`/
  `useStore` overrides now nest under a single `hooks: {...}` key instead of being
  passed as three top-level options. Only relevant if we need a custom React context
  for the store (not expected here).
- **Tag invalidation timing default changed**: `invalidationBehavior` defaults to
  `'delayed'` (batches invalidations within a dispatch tick) instead of the 1.x
  `'immediately'` behavior. Shouldn't be user-visible but worth knowing if invalidation
  timing looks different from tutorials written against 1.x.
- **`AnyAction` deprecated in favor of `UnknownAction`**; middleware/action typing now
  requires type guards (`isAction()`, `actionCreator.match()`) rather than assuming a
  shape. Relevant only if hand-writing custom middleware (e.g. an analytics
  middleware) alongside RTK Query.
- **New but optional in 2.x**: `createSlice`'s `selectors` field (define selectors
  co-located with the slice) and the `buildCreateSlice`/`asyncThunkCreator` API for
  defining thunks inline via `create.asyncThunk(...)` inside `reducers`. Neither is
  required — the classic `createAsyncThunk` + `extraReducers` builder pattern above
  still works and is simpler to review as a first migration pass.
- **Codemods exist** (`@reduxjs/rtk-codemods`) for the `extraReducers` object→builder
  conversion, useful only if porting an existing pre-2.x Redux codebase — not
  applicable here since there's no existing Redux code, but worth knowing if any
  copy-pasted tutorial snippets use 1.x syntax.

Sources:
- https://redux-toolkit.js.org/usage/migrating-rtk-2
- https://github.com/reduxjs/redux-toolkit/discussions/3945

---

## Open questions to resolve before/during implementation

1. Do we actually need a plain Redux **auth slice**, or can `getMe` be an RTK Query
   endpoint with tags, eliminating a separate slice? (See §6.)
2. What's the concrete SSR-seeding strategy for the App Router — `upsertQueryData` in
   a client-mount effect (§5) vs. keeping server components on raw `fetch` and never
   touching the RTK Query cache server-side at all (simplest, but loses "no client
   fetch on first paint" for RTK-Query-backed data, unlike the current TanStack
   `HydrationBoundary` behavior).
3. Whether `axiosBaseQuery` should wrap the *existing* `src/lib/api.js` instance
   (preserves interceptor/error-shape behavior, recommended) or a fresh axios call
   per the docs' literal example (would duplicate interceptor logic) — recommend the
   former; needs sign-off since it changes what `data`/`error` look like at the RTK
   Query call site vs. the docs' example.
