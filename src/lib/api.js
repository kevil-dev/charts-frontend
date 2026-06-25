import axios from "axios";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Add it to .env.local before starting the dev server."
  );
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token from localStorage (SSR-safe)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Unwrap the data envelope; normalise errors so callers never inspect axios internals
api.interceptors.response.use(
  (response) => response.data.data,
  (err) => {
    // Preserve cancellations untouched — callers use axios.isCancel / err.name to ignore them
    if (axios.isCancel(err)) {
      return Promise.reject(err);
    }
    const status = err.response?.status ?? 0;
    const message =
      err.response?.data?.msg ?? err.message ?? "An unexpected error occurred.";
    const normalised = new Error(message);
    normalised.status = status;
    normalised.code = err.code;
    return Promise.reject(normalised);
  }
);

export const chartsApi = {
  /** Fetch paginated chart results */
  getCharts({ platform, country, chart, page = 1, limit = 50, signal }) {
    return api.get("/charts", {
      params: {
        platform,
        country: country.toUpperCase(),
        chart,
        page,
        limit,
      },
      signal,
    });
  },

  /** Fetch available countries and genre filters for a given platform */
  getFilters({ platform, country, signal }) {
    return api.get("/charts/filters", {
      params: {
        platform,
        ...(country ? { country: country.toUpperCase() } : {}),
      },
      signal,
    });
  },
};

export default api;
