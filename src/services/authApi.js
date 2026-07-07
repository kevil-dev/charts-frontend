import api from "@/lib/api";

export const authApi = {
  login: ({ email, password }) => api.post("/auth/login", { email, password }),
  register: ({ name, email, password }) =>
    api.post("/auth/register", { name, email, password }),
  google: (credential) => api.post("/auth/google", { credential }),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};