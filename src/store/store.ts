import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import { listsApi } from "@/services/listsApiSlice";
import { chartsApi } from "@/services/chartsApiSlice";
import { billingApi } from "@/services/billingApiSlice";
import { podcastApi } from "@/services/podcastApiSlice";

// RootState is derived from this standalone reducer map, not from makeStore's
// return type — deriving it via ReturnType<typeof makeStore> would be circular
// once makeStore's own preloadedState parameter is typed as Partial<RootState>.
const rootReducer = combineReducers({
  auth: authReducer,
  [listsApi.reducerPath]: listsApi.reducer,
  [chartsApi.reducerPath]: chartsApi.reducer,
  [billingApi.reducerPath]: billingApi.reducer,
  [podcastApi.reducerPath]: podcastApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// Creates a fresh store instance per call so Redux state never leaks between
// requests — each client component tree (and any future server render) gets its
// own store. Redux DevTools is enabled by default in configureStore (dev only).
// preloadedState lets StoreProvider seed auth state from a server-fetched user
// so there's no loading flash on first paint.
export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        listsApi.middleware,
        chartsApi.middleware,
        billingApi.middleware,
        podcastApi.middleware
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
