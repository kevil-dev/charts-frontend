import { listsApi } from "@/services/listsApiSlice";
import { chartsApi } from "@/services/chartsApiSlice";
import { billingApi } from "@/services/billingApiSlice";
import { podcastApi } from "@/services/podcastApiSlice";

// Kept out of authSlice.js deliberately — authSlice is imported by StoreProvider
// at the root of every page, so it stays a minimal, early-loaded module. This
// helper is only imported from UI callsites (logout buttons, login success
// handlers), which are leaves of the import graph, avoiding any risk of
// authSlice pulling in all four (larger) API slice modules.
export function resetAllApiCaches(dispatch) {
  dispatch(listsApi.util.resetApiState());
  dispatch(chartsApi.util.resetApiState());
  dispatch(billingApi.util.resetApiState());
  dispatch(podcastApi.util.resetApiState());
}
