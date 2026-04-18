import { store } from "@/store";
import { logout, setCredentials } from "@/store/slices/authSlice";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (config.headers.Authorization) {
      return config;
    }
    const accessToken = store.getState().auth.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("LỖI NHẬN ĐƯỢC:", error.response?.status, error.message);
    const originalRequest = error.config;

    if (originalRequest.url?.includes("users/refresh")) {
      store.dispatch(logout());
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_API_URL}users/refresh-token`,
          {},
          { withCredentials: true },
        );

        const data = response.data.data;


        store.dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.accessToken,
            role: data.user.role,
          }),
        );

        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error(">>> Refresh thất bại!", refreshError);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;