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

const attachInterceptors = (instance: any) => {
  instance.interceptors.request.use((config: any) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    config.headers["x-timezone"] = timezone;

    return config;
  });

  instance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
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

attachInterceptors(api);

export default api;
