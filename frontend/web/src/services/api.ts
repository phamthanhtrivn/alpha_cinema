import { store } from "@/store";
import { logout, setCredentials } from "@/store/slices/authSlice";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 1000;
const requestTimestamps: number[] = [];

const waitForRateLimitSlot = async () => {
  while (true) {
    const now = Date.now();

    while (
      requestTimestamps.length > 0 &&
      requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS
    ) {
      requestTimestamps.shift();
    }

    if (requestTimestamps.length < RATE_LIMIT_MAX_REQUESTS) {
      requestTimestamps.push(now);
      return;
    }

    const waitTime = requestTimestamps[0] + RATE_LIMIT_WINDOW_MS - now;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const performRefreshToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_API_URL}/users/refresh-token`,
      {},
      { withCredentials: true },
    );

    const data = response.data.data;

    store.dispatch(
      setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        role: data.user.role,
        cinemaId: data.user.cinemaId,
      }),
    );

    localStorage.setItem("hasSession", "true");
    processQueue(null, data.accessToken);
    return data.accessToken;
  } catch (refreshError) {
    processQueue(refreshError, null);
    localStorage.removeItem("hasSession");
    store.dispatch(logout());
    return null;
  } finally {
    isRefreshing = false;
  }
};

apiClient.interceptors.request.use(
  async (config) => {
    await waitForRateLimitSlot();

    if (config.headers.Authorization) {
      return config;
    }

    if (
      config.url?.includes("users/refresh-token") ||
      config.url?.includes("users/login") ||
      config.url?.includes("users/register")
    ) {
      if (config.url?.includes("users/logout")) {
        localStorage.removeItem("hasSession");
      }
      return config;
    }

    let accessToken = store.getState().auth.accessToken;

    if (!accessToken && localStorage.getItem("hasSession") === "true") {
      accessToken = await performRefreshToken();
    }

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
  (response) => {
    if (response.data?.data?.accessToken) {
      localStorage.setItem("hasSession", "true");
    }
    return response;
  },
  async (error) => {
    console.log("LỖI NHẬN ĐƯỢC:", error.response?.status, error.message);
    const originalRequest = error.config;

    if (
      originalRequest.url?.includes("users/refresh") ||
      originalRequest.url?.includes("users/logout")
    ) {
      localStorage.removeItem("hasSession");
      store.dispatch(logout());
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await performRefreshToken();
        if (!newAccessToken) {
          return Promise.reject(error);
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
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