import { useState, useEffect, useCallback, useRef } from "react";
import { chartsApi } from "@/lib/api";

/** Module-level cache: platform → { countries, genres, fetchedAt } */
const filtersCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function clearFiltersCache(platform) {
  if (platform) filtersCache.delete(platform);
  else filtersCache.clear();
}

/**
 * Fetches available countries and genre filters for a given platform.
 * Only refetches when `platform` changes — country is passed for the
 * initial scoping but intentionally excluded from deps to avoid
 * re-fetching on every country navigation.
 * Results are cached in-memory per platform for CACHE_TTL_MS.
 */
export function useFilters({ platform, country }) {
  const [countries, setCountries] = useState(null);
  const [genres, setGenres] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const abortRef = useRef(null);
  // Keep a stable ref to country so the callback can read the latest
  // value without it being a reactive dependency
  const countryRef = useRef(country);
  useEffect(() => { countryRef.current = country; }, [country]);

  const fetch = useCallback(async () => {
    if (!platform) return;

    // Serve from cache if still fresh — no network call, no loading state
    const cacheKey = platform;
    const cached = filtersCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setCountries(cached.countries);
      setGenres(cached.genres);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const result = await chartsApi.getFilters({
        platform,
        country: countryRef.current,
        signal: abortRef.current.signal,
      });
      const entry = {
        countries: result.countries ?? [],
        genres: result.genres ?? [],
        fetchedAt: Date.now(),
      };
      filtersCache.set(cacheKey, entry);
      setCountries(entry.countries);
      setGenres(entry.genres);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      // Silently fall back to static config — callers handle the null case
    } finally {
      setIsLoading(false);
    }
  }, [platform]); // Only platform as dep — intentional, see JSDoc above

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { countries, genres, isLoading };
}
