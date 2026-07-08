"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import { fetchUser } from "@/store/authSlice";

export default function StoreProvider({ children }) {
  // Lazy initialiser runs exactly once per component instance, so the store is
  // created once per client tree (not a module-level singleton) without reading
  // a ref during render — which this project's React Compiler lint rules forbid.
  const [store] = useState(() => makeStore());

  useEffect(() => {
    // Initialise auth state from the httpOnly mp_token cookie on first load.
    store.dispatch(fetchUser());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
