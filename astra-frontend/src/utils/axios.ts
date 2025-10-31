import axios from "axios";
import Cookies from "js-cookie";
import axiosRetry from "axios-retry";
import { DEV_URL } from "./constant";

const instance = axios.create({
  baseURL: DEV_URL,
  timeout: 30000,
});

// Configure retries for specific errors (e.g., timeout, 5xx errors)
axiosRetry(instance, {
  retries: 3, // Retry up to 3 times
  retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff (1s, 2s, 3s)
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) || // Retry on network errors or timeouts
      error.response?.status >= 500 // Retry on server errors
    );
  },
});

// Rest of your interceptor code remains the same
let isRedirecting = false;

instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      Cookies.remove("auth_token");
      Cookies.remove("refresh_token");
      delete instance.defaults.headers.common["Authorization"];
      if (typeof window !== "undefined") {
        localStorage.setItem("logout", Date.now().toString());
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
