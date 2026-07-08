import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "@/lib/axiosBaseQuery";

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BillingStatus"],
  endpoints: (build) => ({
    getBillingStatus: build.query({
      query: () => ({ url: "/billing/status", method: "GET" }),
      keepUnusedDataFor: 60,
      providesTags: ["BillingStatus"],
    }),

    checkout: build.mutation({
      // No tag invalidation — checkout redirects to Stripe, response is a URL.
      query: ({ tier, interval }) => ({
        url: "/billing/checkout",
        method: "POST",
        data: { tier, interval },
      }),
    }),

    cancel: build.mutation({
      query: () => ({ url: "/billing/cancel", method: "POST" }),
      invalidatesTags: ["BillingStatus"],
    }),

    upgrade: build.mutation({
      query: () => ({ url: "/billing/upgrade", method: "POST" }),
      invalidatesTags: ["BillingStatus"],
    }),
  }),
});

export const {
  useGetBillingStatusQuery,
  useCheckoutMutation,
  useCancelMutation,
  useUpgradeMutation,
} = billingApi;
