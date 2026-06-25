import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { chartsApi } from "@/lib/api";

export function useCharts({ platform, country, category, page = 1 }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    if (!platform || !country || !category) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

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
        signal: controller.signal,
      });
      // Ignore results from a request that has since been superseded
      if (controller.signal.aborted || abortRef.current !== controller) return;
      setData(result);
      setIsError(false);
      setError(null);
    } catch (err) {
      // Never surface cancellations
      if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") return;
      // Ignore errors from a superseded request
      if (abortRef.current !== controller) return;
      setIsError(true);
      setError(err);
    } finally {
      // Only the current request owns the loading flags
      if (abortRef.current === controller) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [platform, country, category, page]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { data, isLoading, isError, error, isFetching, refetch: fetch };
}
