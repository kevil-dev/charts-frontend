import api from "@/lib/api";

export const chartsApi = {
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