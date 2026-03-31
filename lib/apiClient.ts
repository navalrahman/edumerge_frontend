"use client";

import axios from "axios";
import Cookies from "js-cookie";

const baseURL =
  process.env.NEXT_PUBLIC_API_NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_PRODUCTION_BASE_URL
    : process.env.NEXT_PUBLIC_API_DEVELOPMENT_BASE_URL;

const api = axios.create({
  baseURL: baseURL || "",
  withCredentials: true,
});

// Helper to attach interceptors to any instance
const attachInterceptors = (instance: any) => {
  // attach token dynamically to every request
  instance.interceptors.request.use((config: any) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    config.headers["x-timezone"] = timezone;

    return config;
  });

  // handle responses and errors
  instance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      // Handle 401 Unauthorized (session expired/invalid)
      if (error.response?.status === 401) {
        Cookies.remove("token", { path: "/" });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );
};

// Initialize interceptors
attachInterceptors(api);

export default api;
