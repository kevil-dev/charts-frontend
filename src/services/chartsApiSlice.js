import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "@/lib/axiosBaseQuery";

export const chartsApi = createApi({
  reducerPath: "chartsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Charts", "Filters"],
  endpoints: (build) => ({
    getCharts: build.query({
      query: ({ platform, country, chart, page }) => ({
        url: "/charts",
        method: "GET",
        params: {
          platform,
          country: country.toUpperCase(),
          chart,
          page,
          limit: 50,
        },
      }),
      providesTags: (result, error, { platform, country, chart, page }) => [
        { type: "Charts", id: `${platform}-${country}-${chart}-${page}` },
      ],
    }),

    getFilters: build.query({
      query: ({ platform, country }) => ({
        url: "/charts/filters",
        method: "GET",
        params: {
          platform,
          ...(country ? { country: country.toUpperCase() } : {}),
        },
      }),
      keepUnusedDataFor: 300,
      providesTags: (result, error, { platform, country }) => [
        { type: "Filters", id: `${platform}-${country ?? "all"}` },
      ],
    }),
  }),
});

export const { useGetChartsQuery, useGetFiltersQuery } = chartsApi;
