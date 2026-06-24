import { useState, useEffect, useCallback } from "react";
import { chartsApi } from "@/lib/api";

/**
 * Fetches available countries and genre filters.
 * staleTime equivalent: caches per [platform, country] for the component lifetime.
 */
export function useFilters({ platform, country }) {
  const [countries, setCountries] = useState(null);
  const [genres, setGenres] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!platform) return;
    setIsLoading(true);
    try {
      const result = await chartsApi.getFilters({ platform, country });
      setCountries(result.countries ?? []);
      setGenres(result.genres ?? []);
    } catch {
      // Silently fall back to static config — callers handle the null case
    } finally {
      setIsLoading(false);
    }
  }, [platform, country]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { countries, genres, isLoading };
}
