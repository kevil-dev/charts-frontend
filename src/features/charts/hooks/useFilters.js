import { useQuery } from "@tanstack/react-query";
import { chartsApi } from "@/features/charts/services/chartsApi";

export function useFilters({ platform, country }) {
  const query = useQuery({
    queryKey: ["filters", platform, country],
    queryFn: ({ signal }) => chartsApi.getFilters({ platform, country, signal }),
    enabled: !!platform,
    staleTime: 5 * 60 * 1000,
  });

  return {
    countries: query.data?.countries ?? null,
    genres: query.data?.genres ?? null,
    isLoading: query.isLoading,
  };
}