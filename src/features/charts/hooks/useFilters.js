import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { chartsApi } from "@/features/charts/services/chartsApi";

/** Module-level cache: cacheKey (platform-country) → { countries, genres, fetchedAt } */
const filtersCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function clearFiltersCache(platform) {
  if (!platform) {
    filtersCache.clear();
    return;
  }
  for (const key of filtersCache.keys()) {
    if (key.startsWith(`${platform}-`)) {
      filtersCache.delete(key);
    }
  }
}

export function useFilters({ platform, country }) {
  const [countries, setCountries] = useState(null);
  const [genres, setGenres] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    if (!platform) return;

    const cacheKey = `${platform}-${country || 'GLOBAL'}`;

    const cached = filtersCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setCountries(cached.countries);
      setGenres(cached.genres);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const result = await chartsApi.getFilters({
        platform,
        country,
        signal: controller.signal,
      });
      if (controller.signal.aborted || abortRef.current !== controller) return;
      
      const countriesData = result.countries ?? [];
      const genresData = result.genres ?? [];
      
      filtersCache.set(cacheKey, {
        countries: countriesData,
        genres: genresData,
        fetchedAt: Date.now(),
      });
      
      setCountries(countriesData);
      setGenres(genresData);
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") return;
      
    } finally {
      if (abortRef.current === controller) setIsLoading(false);
    }
  }, [platform, country]); 

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { countries, genres, isLoading };
}