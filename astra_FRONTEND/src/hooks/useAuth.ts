"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/utils/api.class";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  fullName: string;
  verified: boolean;
  userType: string;
  walletAddress: string;
  profileCompleted: boolean;
  identityVerified: boolean;
  brandName?: string;
  brandOrigin?: string;
  brandStory?: string;
  brandLogo?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  pendingEmail: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window !== "undefined") {
      try {
        const token = Cookies.get("auth_token");
        const userData = sessionStorage.getItem("user_data");
        const pendingEmail = sessionStorage.getItem("pending_email") || "";

        if (token && userData && !isExpired(token)) {
          const user = JSON.parse(userData);
          return {
            user,
            pendingEmail,
            isAuthenticated: true,
            isLoading: false,
            error: "",
          };
        }
      } catch {
        // fail silently
      }
    }

    return {
      user: null,
      pendingEmail: "",
      isAuthenticated: false,
      isLoading: false,
      error: "",
    };
  });

  const router = useRouter();

  /** Utility: Check JWT expiry */
  const isExpired = (token: string): boolean => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  };

  const setError = useCallback((error: string) => {
    setAuthState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: "" }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setAuthState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const saveAuth = useCallback(
    (user: User, tokens: { accessToken: string; refreshToken: string }) => {
      Cookies.set("auth_token", tokens.accessToken, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      Cookies.set("refresh_token", tokens.refreshToken, {
        expires: 30,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      sessionStorage.setItem("user_data", JSON.stringify(user));
      sessionStorage.removeItem("pending_email");

      setAuthState({
        user,
        pendingEmail: "",
        isAuthenticated: true,
        isLoading: false,
        error: "",
      });
    },
    []
  );

  const savePendingEmail = useCallback((email: string) => {
    sessionStorage.setItem("pending_email", email);
    setAuthState((prev) => ({ ...prev, pendingEmail: email }));
  }, []);

  const navigateBasedOnUserState = useCallback(
    (user: User) => {
      if (!user.verified) {
        router.push("/register/verify-otp");
      } else {
        router.push("/dashboard/aiagent/chat");
      }
    },
    [router]
  );

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    setLoading(true);
    clearError();

    try {
      const response = await api.registerCreator({
        ...data,
        role: "creator" as const,
      });

      if (response.status) {
        savePendingEmail(data.email);
        router.push("/register/verify-otp");
      } else {
        throw new Error("Invalid or Existing Credentials");
      }
    } catch {
      setError("Invalid or Existing Credentials");
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    clearError();

    try {
      const response = await api.login(data);

      if (response.status) {
        const { user, accessToken, refreshToken } = response.data;

        if (isExpired(accessToken)) {
          throw new Error("Session expired, please log in again");
        }

        saveAuth(user, { accessToken, refreshToken });
        navigateBasedOnUserState(user);
      } else {
        throw new Error("Invalid Email or Password");
      }
    } catch (error) {
      if (error.message?.includes("not verified")) {
        savePendingEmail(data.email);
        router.push("/register/verify-otp");
      } else {
        setError(error.message || "Invalid Email or Password");
        console.log(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setLoading(true);
    clearError();

    try {
      const email =
        authState.pendingEmail || sessionStorage.getItem("pending_email");
      if (!email) {
        throw new Error("Email not found. Please try registering again.");
      }

      const response = await api.verifyCreatorOTP({ email, otp });

      if (response.status) {
        const { user, accessToken, refreshToken } = response.data;

        if (isExpired(accessToken)) {
          throw new Error("Session expired, please log in again");
        }

        saveAuth(user, { accessToken, refreshToken });
        router.push("/register/brand-profile");
      } else {
        throw new Error("OTP verification failed");
      }
    } catch {
      setError("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const createBrandProfile = async (data: {
    brandName: string;
    brandOrigin: string;
    brandStory: string;
    brandLogo: File;
  }) => {
    setLoading(true);
    clearError();

    try {
      const response = await api.createBrandDetails(
        data.brandName,
        data.brandOrigin,
        data.brandStory,
        data.brandLogo
      );

      if (response.status) {
        const updatedUser = response.data;
        sessionStorage.setItem("user_data", JSON.stringify(updatedUser));
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
        }));
        router.push("/register/wallet");
      } else {
        throw new Error("Brand profile creation failed");
      }
    } catch {
      setError("Brand profile creation failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    sessionStorage.clear();

    setAuthState({
      user: null,
      pendingEmail: "",
      isAuthenticated: false,
      isLoading: false,
      error: "",
    });

    // sync logout across tabs
    localStorage.setItem("logout", Date.now().toString());

    router.push("/login");
  }, [router]);

  /** Sync logout across multiple tabs */
  useEffect(() => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key === "logout") {
        router.push("/login");
      }
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, [router]);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    pendingEmail: authState.pendingEmail,
    error: authState.error,
    register,
    login,
    verifyOTP,
    createBrandProfile,
    logout,
    clearError,
  };
};

// "use client";

// import { useState, useCallback, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Cookies from "js-cookie";
// import api from "@/utils/api.class";
// import { jwtDecode } from "jwt-decode";

// interface User {
//   id: string;
//   email: string;
//   fullName: string;
//   verified: boolean;
//   userType: string;
//   walletAddress: string;
//   profileCompleted: boolean;
//   identityVerified: boolean;
//   brandName?: string;
//   brandOrigin?: string;
//   brandStory?: string;
//   brandLogo?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface AuthState {
//   user: User | null;
//   pendingEmail: string;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string;
// }

// export const useAuth = () => {
//   const [authState, setAuthState] = useState<AuthState>(() => {
//     if (typeof window !== "undefined") {
//       try {
//         const token = Cookies.get("auth_token");
//         const userData = sessionStorage.getItem("user_data"); // safer than localStorage
//         const pendingEmail = sessionStorage.getItem("pending_email") || "";

//         if (token && userData && !isExpired(token)) {
//           const user = JSON.parse(userData);
//           return {
//             user,
//             pendingEmail,
//             isAuthenticated: true,
//             isLoading: false,
//             error: "",
//           };
//         }
//       } catch {
//         // fail silently
//       }
//     }

//     return {
//       user: null,
//       pendingEmail: "",
//       isAuthenticated: false,
//       isLoading: false,
//       error: "",
//     };
//   });

//   const router = useRouter();

//   /** Utility: Check JWT expiry */
//   const isExpired = (token: string): boolean => {
//     try {
//       const { exp } = jwtDecode<{ exp: number }>(token);
//       return Date.now() >= exp * 1000;
//     } catch {
//       return true;
//     }
//   };

//   const setError = useCallback((error: string) => {
//     setAuthState((prev) => ({ ...prev, error }));
//   }, []);

//   const clearError = useCallback(() => {
//     setAuthState((prev) => ({ ...prev, error: "" }));
//   }, []);

//   const setLoading = useCallback((loading: boolean) => {
//     setAuthState((prev) => ({ ...prev, isLoading: loading }));
//   }, []);

//   const saveAuth = useCallback(
//     (user: User, tokens: { accessToken: string; refreshToken: string }) => {
//       Cookies.set("auth_token", tokens.accessToken, {
//         expires: 7,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//       });
//       Cookies.set("refresh_token", tokens.refreshToken, {
//         expires: 30,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//       });

//       // user data is not highly sensitive, but still avoid localStorage
//       sessionStorage.setItem("user_data", JSON.stringify(user));
//       sessionStorage.removeItem("pending_email");

//       setAuthState({
//         user,
//         pendingEmail: "",
//         isAuthenticated: true,
//         isLoading: false,
//         error: "",
//       });
//     },
//     []
//   );

//   const savePendingEmail = useCallback((email: string) => {
//     sessionStorage.setItem("pending_email", email);
//     setAuthState((prev) => ({ ...prev, pendingEmail: email }));
//   }, []);

//   const navigateBasedOnUserState = useCallback(
//     (user: User) => {
//       if (!user.verified) {
//         router.push("/register/verify-otp");
//       } else {
//         router.push("/dashboard/aiagent/chat");
//       }
//     },
//     [router]
//   );

//   const register = async (data: {
//     email: string;
//     password: string;
//     fullName: string;
//   }) => {
//     setLoading(true);
//     clearError();

//     try {
//       const response = await api.registerCreator({
//         ...data,
//         role: "creator" as const,
//       });

//       if (response.status) {
//         savePendingEmail(data.email);
//         router.push("/register/verify-otp");
//       } else {
//         throw new Error("Invalid or Existing Credentials");
//       }
//     } catch {
//       setError("Invalid or Existing Credentials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (data: { email: string; password: string }) => {
//     setLoading(true);
//     clearError();

//     try {
//       const response = await api.login(data);

//       if (response.status) {
//         const { user, accessToken, refreshToken } = response.data;

//         if (isExpired(accessToken)) {
//           throw new Error("Session expired, please log in again");
//         }

//         saveAuth(user, { accessToken, refreshToken });
//         navigateBasedOnUserState(user);
//       } else {
//         throw new Error("Invalid Email or Password");
//       }
//     } catch (error: any) {
//       if (error.message.includes("not verified")) {
//         savePendingEmail(data.email);
//         router.push("/register/verify-otp");
//       } else {
//         setError(error.message || "Invalid Email or Password");
//         console.log(error);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOTP = async (otp: string) => {
//     setLoading(true);
//     clearError();

//     try {
//       const email =
//         authState.pendingEmail || sessionStorage.getItem("pending_email");
//       if (!email) {
//         throw new Error("Email not found. Please try registering again.");
//       }

//       const response = await api.verifyCreatorOTP({ email, otp });

//       if (response.status) {
//         const { user, accessToken, refreshToken } = response.data;

//         if (isExpired(accessToken)) {
//           throw new Error("Session expired, please log in again");
//         }

//         saveAuth(user, { accessToken, refreshToken });
//         router.push("/register/brand-profile");
//       } else {
//         throw new Error("OTP verification failed");
//       }
//     } catch {
//       setError("OTP verification failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createBrandProfile = async (data: {
//     brandName: string;
//     brandOrigin: string;
//     brandStory: string;
//     brandLogo: File;
//   }) => {
//     setLoading(true);
//     clearError();

//     try {
//       const response = await api.createBrandDetails(
//         data.brandName,
//         data.brandOrigin,
//         data.brandStory,
//         data.brandLogo
//       );

//       if (response.status) {
//         const updatedUser = response.data;
//         sessionStorage.setItem("user_data", JSON.stringify(updatedUser));
//         setAuthState((prev) => ({
//           ...prev,
//           user: updatedUser,
//           isLoading: false,
//         }));
//         router.push("/register/wallet");
//       } else {
//         throw new Error("Brand profile creation failed");
//       }
//     } catch {
//       setError("Brand profile creation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = useCallback(() => {
//     Cookies.remove("auth_token");
//     Cookies.remove("refresh_token");
//     sessionStorage.clear();

//     setAuthState({
//       user: null,
//       pendingEmail: "",
//       isAuthenticated: false,
//       isLoading: false,
//       error: "",
//     });

//     // sync logout across tabs
//     localStorage.setItem("logout", Date.now().toString());

//     router.push("/login");
//   }, [router]);

//   /** Sync logout across multiple tabs */
//   useEffect(() => {
//     const syncLogout = (event: StorageEvent) => {
//       if (event.key === "logout") {
//         router.push("/login");
//       }
//     };
//     window.addEventListener("storage", syncLogout);
//     return () => window.removeEventListener("storage", syncLogout);
//   }, [router]);

//   return {
//     user: authState.user,
//     isAuthenticated: authState.isAuthenticated,
//     isLoading: authState.isLoading,
//     pendingEmail: authState.pendingEmail,
//     error: authState.error,
//     register,
//     login,
//     verifyOTP,
//     createBrandProfile,
//     logout,
//     clearError,
//   };
// };
