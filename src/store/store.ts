import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";

// Creates a fresh store instance per call so Redux state never leaks between
// requests — each client component tree (and any future server render) gets its
// own store. Redux DevTools is enabled by default in configureStore (dev only).
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        // API_MIDDLEWARE_PLACEHOLDER — RTK Query api.middleware added here per slice
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
