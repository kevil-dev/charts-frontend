import api from "@/lib/api";

export const billingApi = {
  checkout: (tier, interval) => api.post("/billing/checkout", { tier, interval }),
  status: () => api.get("/billing/status"),
  cancel: () => api.post("/billing/cancel"),
  upgrade: () => api.post("/billing/upgrade"),
};
