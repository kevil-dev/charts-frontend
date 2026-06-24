import { useState, useEffect, useCallback, useRef } from "react";
import { chartsApi } from "@/lib/api";

/**
 * Fetches paginated chart data.
 * Maps the URL `category` slug to the `chart` query param the API expects.
 */
export function useCharts({ platform, country, category, page = 1 }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Abort any in-flight request when deps change
  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    if (!platform || !country || !category) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsFetching(true);
    if (!data) setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await chartsApi.getCharts({
        platform,
        country,
        chart: category, // category slug maps directly to `chart` param
        page,
      });
      setData(result);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, country, category, page]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { data, isLoading, isError, error, isFetching, refetch: fetch };
}
