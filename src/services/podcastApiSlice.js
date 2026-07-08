import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "@/lib/axiosBaseQuery";

export const podcastApi = createApi({
  reducerPath: "podcastApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PodcastMeta"],
  endpoints: (build) => ({
    getPodcastMeta: build.query({
      query: (matchKey) => ({
        url: "/podcasts/meta",
        method: "GET",
        params: { match_key: matchKey },
      }),
      // The server wraps the payload as { meta: {...} }; the old podcastMetaApi
      // service unwrapped this before returning. Replicate that here so `data`
      // is the meta object directly, matching the old hook's return shape.
      transformResponse: (response) => response.meta,
      keepUnusedDataFor: 300,
      providesTags: (result, error, matchKey) => [
        { type: "PodcastMeta", id: matchKey },
      ],
      // RTK Query queries have no automatic retry unless wrapped with the
      // `retry` utility (unlike TanStack Query's default of 3 retries), so
      // this already matches the old hook's retry: false without extra config.
    }),
  }),
});

export const { useGetPodcastMetaQuery } = podcastApi;
