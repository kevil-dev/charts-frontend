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

  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    if (!platform || !country || !category) return;

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // Always clear stale data so old rows never show during a new fetch
    setData(null);
    setIsLoading(true);
    setIsFetching(true);
    setIsError(false);
    setError(null);

    try {
      const result = await chartsApi.getCharts({
        platform,
        country,   // api.js uppercases — do NOT uppercase here
        chart: category,
        page,
        limit: 50,
        signal: abortRef.current.signal,
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
  }, [platform, country, category, page]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { data, isLoading, isError, error, isFetching, refetch: fetch };
}
