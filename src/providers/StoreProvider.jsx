"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import { fetchUser } from "@/store/authSlice";

export default function StoreProvider({ children, initialUser = null }) {
  // Lazy initialiser runs exactly once per component instance, so the store is
  // created once per client tree (not a module-level singleton) without reading
  // a ref during render — which this project's React Compiler lint rules forbid.
  // Seeding auth state via preloadedState (not a post-mount dispatch) avoids a
  // loading flash when the server already resolved the user from the cookie.
  const [store] = useState(() =>
    makeStore({ auth: { user: initialUser, isLoading: !initialUser } })
  );

  useEffect(() => {
    // Only fetch if the server didn't already resolve a user — avoids
    // re-triggering isLoading when we already trust the server-fetched value.
    if (!initialUser) {
      store.dispatch(fetchUser());
    }
  }, [store, initialUser]);

  return <Provider store={store}>{children}</Provider>;
}
