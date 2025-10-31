'use client';

import useSWR from 'swr';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// change if your backend uses a different refresh path
const REFRESH_PATH = `${API_BASE}/auth/refresh`;

/**
 * Try to refresh access token using stored refresh token.
 * If successful, store the new access token (jwt_token) and return it.
 * Returns null on failure.
 */
async function refreshAccessToken(): Promise<string | null> {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            console.warn('No refresh_token found in localStorage.');
            return null;
        }

        const res = await fetch(REFRESH_PATH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
            cache: 'no-store',
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            console.error('Refresh token request failed:', res.status, res.statusText, text);
            return null;
        }

        const data = await res.json();
        // support multiple possible shapes: { data: { accessToken } }, { accessToken }, { token }
        const newToken = data?.data?.accessToken || data?.accessToken || data?.token || data?.data?.token;
        if (!newToken) {
            console.error('Refresh response did not contain a new access token:', data);
            return null;
        }

        localStorage.setItem('jwt_token', newToken);
        console.log('🔁 Access token refreshed and saved (preview):', newToken.slice(0, 12) + '…');
        return newToken;
    } catch (err) {
        console.error('Error refreshing access token:', err);
        return null;
    }
}

/**
 * Perform fetch with Authorization header. If 401, attempt refresh once and retry.
 */
/**
 * Perform fetch with Authorization header. If 401, attempt refresh once and retry.
 */
async function requestWithAuth(url: string, opts: RequestInit = {}): Promise<any> {
    // build headers (do not mutate opts.headers directly)
    const buildHeaders = (token?: string) => {
        const baseHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) baseHeaders.Authorization = `Bearer ${token}`;
        return baseHeaders;
    };

    // 1) initial attempt with current token
    let token = localStorage.getItem('jwt_token');
    let headers = { ...(opts.headers as Record<string, string> || {}), ...buildHeaders(token) };

    let res = await fetch(url, { ...opts, headers, cache: 'no-store' });

    // 2) if unauthorized, try refresh + retry once
    if (res.status === 401) {
        console.warn('401 when fetching', url, '- attempting token refresh...');
        const newToken = await refreshAccessToken();
        if (!newToken) {
            // refresh failed — surface error
            const text = await res.text().catch(() => '');
            console.error('Unauthorized and refresh failed. Server response:', res.status, res.statusText, text);
            throw new Error('Unauthorized - please login again');
        }

        // retry with new token
        headers = { ...(opts.headers as Record<string, string> || {}), ...buildHeaders(newToken) };
        res = await fetch(url, { ...opts, headers, cache: 'no-store' });
    }

    // 3) still not ok -> error
    if (!res.ok) {
        let errorMsg = `Something went wrong: ${res.status}`;
        let errorResponse: any = null;

        try {
            errorResponse = await res.json();
            if (errorResponse?.message) {
                errorMsg = errorResponse.message;
            }
        } catch {
            const text = await res.text().catch(() => '');
            if (text) errorMsg = text;
        }

        console.error('Failed response:', res.status, res.statusText, errorResponse || errorMsg);

        const error = new Error(errorMsg) as any;
        error.response = errorResponse;
        throw error;
    }

    // 4) parse json and return
    const json = await res.json();
    console.log('Raw jobs response:', json);
    return json;
}


// SWR fetcher
const fetcher = (url: string) => requestWithAuth(url);

export function useJobs() {
    const { data, error, isLoading } = useSWR(
        `${API_BASE}/marketplace/maker/jobs`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 1000 * 60, // 1 minute
        }
    );

    // accept multiple common shapes: array, { data: [] }, { jobs: [] }
    const jobs =
        Array.isArray(data) ? data :
            data?.data ?? data?.jobs ?? [];

    return {
        jobs,
        isLoading,
        isError: error,
    };
}

export { requestWithAuth };