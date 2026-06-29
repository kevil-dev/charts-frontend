import axios from "axios";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Add it to .env.local before starting the dev server."
  );
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response.data.data,
  (err) => {
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

export default api;