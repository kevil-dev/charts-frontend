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

const STATUS_TO_CODE = {
  300: "UPGRADE",
  306: "NO_DATA_FOUND",
  430: "LIMIT_EXCEEDED",
};

api.interceptors.response.use(
  (response) => response.data.data,
  (err) => {
    if (axios.isCancel(err)) {
      return Promise.reject(err);
    }
    const backendCode = err.response?.data?.code;
    const status = err.response?.status ?? 0;
    const message =
      err.response?.data?.msg ?? err.message ?? "An unexpected error occurred.";
    const normalised = new Error(message);
    normalised.status = status;
    normalised.code = STATUS_TO_CODE[backendCode ?? status] ?? err.code;
    return Promise.reject(normalised);
  }
);

export default api;