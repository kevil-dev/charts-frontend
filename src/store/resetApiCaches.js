import { listsApi } from "@/services/listsApiSlice";
import { chartsApi } from "@/services/chartsApiSlice";
import { billingApi } from "@/services/billingApiSlice";
import { podcastApi } from "@/services/podcastApiSlice";

// Kept out of authSlice.js deliberately — authSlice is imported by StoreProvider
// at the root of every page, so pulling all four API slices in there caused a
// "useShareListMutation is not a function" runtime error (a circular/partial
// module-init issue). This helper is only imported from UI callsites (logout
// buttons, login success handlers), which are leaves of the import graph.
export function resetAllApiCaches(dispatch) {
  dispatch(listsApi.util.resetApiState());
  dispatch(chartsApi.util.resetApiState());
  dispatch(billingApi.util.resetApiState());
  dispatch(podcastApi.util.resetApiState());
}
