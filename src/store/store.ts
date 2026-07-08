import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import { listsApi } from "@/services/listsApiSlice";

// Creates a fresh store instance per call so Redux state never leaks between
// requests — each client component tree (and any future server render) gets its
// own store. Redux DevTools is enabled by default in configureStore (dev only).
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [listsApi.reducerPath]: listsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        listsApi.middleware
        // API_MIDDLEWARE_PLACEHOLDER — additional RTK Query api.middleware added here
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
