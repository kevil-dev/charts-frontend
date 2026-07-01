import { useQuery } from "@tanstack/react-query";
import { podcastMetaApi } from "@/features/podcasts/services/podcastMetaApi";

export function usePodcastMeta(matchKey, enabled) {
  return useQuery({
    queryKey: ["podcast-meta", matchKey],
    queryFn: () => podcastMetaApi.get(matchKey),
    enabled: !!matchKey && enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
