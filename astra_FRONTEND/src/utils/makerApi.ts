const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// REGISTER MAKER
export async function registerMaker({
    fullName,
    email,
    password,
}: {
    fullName: string;
    email: string;
    password: string;
}) {
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullName,
                email,
                password,
                role: "maker",
            }),
        });

        const response = await res.json();

        if (!res.ok) {
            console.error("Registration error:", response);
            if (response.message === "User already exists") return { alreadyExists: true };
            throw new Error(response?.message || "Registration failed");
        }

        console.log("✅ Registration success:", response);
        return response;
    } catch (err: any) {
        console.error("Catch block error (registerMaker):", err);
        throw new Error(err?.message || "Something went wrong during registration");
    }
}

// LOGIN MAKER
export async function loginMaker({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const response = await res.json();

        if (!res.ok) {
            console.error("Login error:", response);
            throw new Error(response?.message || "Login failed");
        }

        // Save tokens and user in localStorage
        if (response?.data) {
            const { accessToken, refreshToken, user } = response.data;
            if (accessToken) localStorage.setItem("jwt_token", accessToken);
            // After successful login
            localStorage.setItem("user_id", response.data.user.id);
            localStorage.setItem("user_type", response.data.user.userType);

            if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
            if (user) localStorage.setItem("user", JSON.stringify(user));

            console.log("Logged in user details:", user);

            console.log("🔐 Login successful. Tokens saved:", {
                accessTokenPreview: accessToken?.slice(0, 12) + "...",
                hasRefreshToken: Boolean(refreshToken),
            });
        }

        return response;
    } catch (err: any) {
        console.error("Catch block error (loginMaker):", err);
        throw new Error(err?.message || "Something went wrong during login");
    }
}

// VERIFY MAKER OTP
export async function verifyMakerOtp({
    email,
    otp,
}: {
    email: string;
    otp: string;
}) {
    try {
        const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });

        const response = await res.json();

        if (!res.ok) {
            console.error("❌ OTP verification error:", response);
            throw new Error(response?.message || "OTP verification failed");
        }

        if (response?.data) {
            const { accessToken, refreshToken, user } = response.data;
            if (accessToken) localStorage.setItem("jwt_token", accessToken);
            if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
            if (user) localStorage.setItem("user", JSON.stringify(user));

            console.log("🔐 Tokens saved:", {
                accessTokenPreview: accessToken?.slice(0, 12) + "...",
                hasRefreshToken: Boolean(refreshToken),
            });
        }

        return response;
    } catch (err: any) {
        console.error("Catch block error (verifyMakerOtp):", err);
        throw new Error(err?.message || "Something went wrong during OTP verification");
    }
}

// RESEND OTP
export async function resendOtp(email: string) {
    try {
        const res = await fetch(`${BASE_URL}/auth/resend-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const response = await res.json();

        if (!res.ok) {
            console.error("❌ Resend OTP error:", response);
            throw new Error(response?.message || "Failed to resend OTP");
        }

        console.log("📩 Resend OTP success:", response);
        return response;
    } catch (err: any) {
        console.error("Catch block error (resendOtp):", err);
        throw new Error(err?.message || "Something went wrong while resending OTP");
    }
}

// FETCHER WITH AUTO TOKEN REFRESH
export const fetcherWithToken = async (url: string, token: string) => {
    let res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    // If token expired → try refresh
    if (res.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("Session expired. Please login.");

        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        const refreshData = await refreshRes.json();
        if (!refreshRes.ok) throw new Error("Session expired. Please login.");

        // Save new accessToken
        if (refreshData?.accessToken) {
            localStorage.setItem("jwt_token", refreshData.accessToken);
        }

        // Retry original request with new accessToken
        res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshData.accessToken}`,
            },
        });
    }

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message || "Failed to fetch data");
    }

    return res.json();
};
