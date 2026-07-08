import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import { listsApi } from "@/services/listsApiSlice";
import { chartsApi } from "@/services/chartsApiSlice";
import { billingApi } from "@/services/billingApiSlice";
import { podcastApi } from "@/services/podcastApiSlice";

// Creates a fresh store instance per call so Redux state never leaks between
// requests — each client component tree (and any future server render) gets its
// own store. Redux DevTools is enabled by default in configureStore (dev only).
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [listsApi.reducerPath]: listsApi.reducer,
      [chartsApi.reducerPath]: chartsApi.reducer,
      [billingApi.reducerPath]: billingApi.reducer,
      [podcastApi.reducerPath]: podcastApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        listsApi.middleware,
        chartsApi.middleware,
        billingApi.middleware,
        podcastApi.middleware
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
