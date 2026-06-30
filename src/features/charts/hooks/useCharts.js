import { useQuery } from "@tanstack/react-query";
import { chartsApi } from "@/features/charts/services/chartsApi";

export function useCharts({ platform, country, category, page = 1 }) {
  const query = useQuery({
    queryKey: ["charts", platform, country, category, page],
    queryFn: ({ signal }) =>
      chartsApi.getCharts({ platform, country, chart: category, page, limit: 50, signal }),
    enabled: !!platform && !!country && !!category,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}