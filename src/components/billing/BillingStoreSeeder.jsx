"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { billingApi } from "@/services/billingApiSlice";

// Seeds the RTK Query cache with server-fetched billing status on mount, so the
// client-side useGetBillingStatusQuery call in BillingSettings finds a warm cache
// entry instead of firing a duplicate request on first paint.
export default function BillingStoreSeeder({ billingData }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(billingApi.util.upsertQueryData("getBillingStatus", undefined, billingData));
    // Intentionally seeds once per mount, not on every prop change — a new page
    // navigation remounts this component with fresh server-fetched props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
