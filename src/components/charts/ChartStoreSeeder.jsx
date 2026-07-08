"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { chartsApi } from "@/services/chartsApiSlice";

// Seeds the RTK Query cache with server-fetched chart data on mount, so the
// client-side useGetChartsQuery call in ChartSection finds a warm cache entry
// instead of firing a duplicate request on first paint.
export default function ChartStoreSeeder({ chartsData, platform, country, category, page }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      chartsApi.util.upsertQueryData(
        "getCharts",
        { platform, country, chart: category, page },
        chartsData
      )
    );
    // Intentionally seeds once per mount, not on every prop change — a new page
    // navigation remounts this component with fresh server-fetched props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
