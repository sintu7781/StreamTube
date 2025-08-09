import axios from "axios";
import { refreshToken } from "../api/auth";

const axiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // important for sending cookies
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flag to avoid multiple refresh calls at once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ✅ Add interceptor to handle expired access token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already trying to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh token for auth-related endpoints
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshToken(); // make refresh token API call
        const newAccessToken = data?.data?.accessToken || data?.accessToken;

        if (newAccessToken) {
          // Store the new token
          localStorage.setItem("authToken", newAccessToken);
        }

        // Retry failed requests
        processQueue(null, newAccessToken);

        // Add new token to header and retry original request
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.warn("Token refresh failed:", err);
        processQueue(err, null);
        // Only clear token if refresh actually failed, not on network errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("authToken");
          // Force page reload to reinitialize auth context
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
