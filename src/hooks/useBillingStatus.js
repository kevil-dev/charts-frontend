"use client";

import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/services/billingApi";

export function useBillingStatus() {
  return useQuery({
    queryKey: ["billing-status"],
    queryFn: billingApi.status,
    staleTime: 60 * 1000,
  });
}
