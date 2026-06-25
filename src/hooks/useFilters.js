import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { chartsApi } from "@/lib/api";

/** Module-level cache: cacheKey (platform-country) → { countries, genres, fetchedAt } */
const filtersCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function clearFiltersCache(platform) {
  if (!platform) {
    filtersCache.clear();
    return;
  }
  // Safely delete all cached combinations for this specific platform
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
  // NOTE: countryRef was completely removed to allow natural React updates

  const fetch = useCallback(async () => {
    if (!platform) return;

    // 1. The "Dumb Cache" Key
    const cacheKey = `${platform}-${country || 'GLOBAL'}`;

    // Serve from cache if still fresh
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
        country, // 2. Passing the prop directly to the API
        signal: controller.signal,
      });
      if (controller.signal.aborted || abortRef.current !== controller) return;
      
      const countriesData = result.countries ?? [];
      const genresData = result.genres ?? [];
      
      // 3. Save to cache using the unique combination key
      filtersCache.set(cacheKey, {
        countries: countriesData,
        genres: genresData,
        fetchedAt: Date.now(),
      });
      
      setCountries(countriesData);
      setGenres(genresData);
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") return;
      // Silently fall back to static config — callers handle the null case
    } finally {
      if (abortRef.current === controller) setIsLoading(false);
    }
  }, [platform, country]); // 4. country is now correctly tracked as a dependency

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { countries, genres, isLoading };
}