import axios from "axios";
import Cookies from "js-cookie";
import axiosRetry from "axios-retry";
import { DEV_URL } from "./constant";

const baseURL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  DEV_URL;

const instance = axios.create({
  baseURL,
  timeout: 120000, // 120s to tolerate cold starts on free hosting
  headers: {
    "Content-Type": "application/json",
  },
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
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          if (
            refreshResponse.data.status &&
            refreshResponse.data.data.accessToken
          ) {
            const newToken = refreshResponse.data.data.accessToken;
            localStorage.setItem("auth_token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          handleAuthFailure();
        }
      } else {
        handleAuthFailure();
      }
    }

    if (!error.response) {
      console.error("Network error:", error.message);
    }

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

// ✅ Keep this helper function
function handleAuthFailure() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    } catch {}
    window.location.href = "/login";
  }
}

export default instance;










// import axios from "axios";
// import Cookies from "js-cookie";
// import axiosRetry from "axios-retry";
// import { DEV_URL } from "./constant";

// const baseURL =
//   (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) ||
//   DEV_URL;

// const instance = axios.create({
//   baseURL,
//   timeout: 120000, // 120s to tolerate cold starts on free hosting
//   headers: {
//     "Content-Type": "application/json",
//   baseURL: DEV_URL,
//   timeout: 30000,
// });

// // Configure retries for specific errors (e.g., timeout, 5xx errors)
// axiosRetry(instance, {
//   retries: 3, // Retry up to 3 times
//   retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff (1s, 2s, 3s)
//   retryCondition: (error) => {
//     return (
//       axiosRetry.isNetworkOrIdempotentRequestError(error) || // Retry on network errors or timeouts
//       error.response?.status >= 500 // Retry on server errors
//     );
//   },
//   timeoutErrorMessage: "Request timed out. Please try again.",
// });

// // Rest of your interceptor code remains the same
// let isRedirecting = false;

// instance.interceptors.request.use(
//   (config) => {
//     const token = Cookies.get("auth_token");
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// instance.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   async function (error) {
//     const originalRequest = error.config;

//     // Handle 401 errors (unauthorized)
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       // Try to refresh token
//       const refreshToken =
//         typeof window !== "undefined"
//           ? localStorage.getItem("refresh_token")
//           : null;

//       if (refreshToken) {
//         try {
//           // Attempt token refresh
//           const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
//             refreshToken,
//           });

//           if (
//             refreshResponse.data.status &&
//             refreshResponse.data.data.accessToken
//           ) {
//             const newToken = refreshResponse.data.data.accessToken;
//             localStorage.setItem("auth_token", newToken);

//             // Update the failed request with new token
//             originalRequest.headers.Authorization = `Bearer ${newToken}`;

//             // Retry the original request
//             return instance(originalRequest);
//           }
//         } catch (refreshError) {
//           console.error("Token refresh failed:", refreshError);
//           // Token refresh failed, redirect to login
//           handleAuthFailure();
//         }
//       } else {
//         // No refresh token, redirect to login
//         handleAuthFailure();
//       }
//     }

//     // Handle network errors
//     if (!error.response) {
//       console.error("Network error:", error.message);
//     }

//   (response) => response,
//   (error) => {
//     if (error?.response?.status === 401 && !isRedirecting) {
//       isRedirecting = true;
//       Cookies.remove("auth_token");
//       Cookies.remove("refresh_token");
//       delete instance.defaults.headers.common["Authorization"];
//       if (typeof window !== "undefined") {
//         localStorage.setItem("logout", Date.now().toString());
//         window.location.href = "/login";
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// <<<<<<< HEAD
// // Helper function to handle authentication failures
// function handleAuthFailure() {
//   if (typeof window !== "undefined") {
//     try {
//       localStorage.removeItem("auth_token");
//       localStorage.removeItem("refresh_token");
//     } catch {}
//     window.location.href = "/login";
//   }
// }

// export default instance;
// =======
// export default instance;
// >>>>>>> front-end-fixes
