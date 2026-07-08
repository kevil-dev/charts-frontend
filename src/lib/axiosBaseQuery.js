import api from "@/lib/api";

// Wraps the existing Axios instance (src/lib/api.js) as an RTK Query baseQuery.
// The api.js response interceptor already unwraps response.data.data, so the
// value returned by api() IS the payload directly. Errors from api.js are
// already normalised to { message, status, code } — preserve that shape here.
const axiosBaseQuery =
  () =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await api({ url, method, data, params, headers });
      return { data: result };
    } catch (err) {
      return {
        error: {
          status: err.status,
          message: err.message,
          code: err.code,
        },
      };
    }
  };

export default axiosBaseQuery;
