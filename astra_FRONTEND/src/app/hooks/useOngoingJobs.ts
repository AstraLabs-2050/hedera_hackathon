'use client';
import { useQuery } from '@tanstack/react-query';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newToken =
        data?.data?.accessToken ||
        data?.accessToken ||
        data?.token ||
        data?.data?.token;

    if (newToken) localStorage.setItem('jwt_token', newToken);

    return newToken || null;
}

async function fetchWithToken(url: string, token: string | null) {
    let res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });

    if (res.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Unauthorized - please login again');

        res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);

    return data;
}

async function fetchJobs(filter: string) {
    const token = localStorage.getItem('jwt_token');

    if (filter === 'all') {
        // ✅ Fetch all three in parallel
        const [apps, ongoing, completed] = await Promise.all([
            fetchWithToken(`${BASE_URL}/marketplace/maker/jobs?filter=applications`, token),
            fetchWithToken(`${BASE_URL}/marketplace/maker/jobs?filter=ongoing`, token),
            fetchWithToken(`${BASE_URL}/marketplace/maker/jobs?filter=completed`, token),
        ]);

        // ✅ Merge into single array
        const combined = [
            ...(apps?.data || []),
            ...(ongoing?.data || []),
            ...(completed?.data || []),
        ];

        // ✅ Deduplicate by job.id
        const uniqueJobs = Array.from(
            new Map(combined.map((job: any) => [job.id, job])).values()
        );

        return {
            status: true,
            message: 'Success',
            data: uniqueJobs,
        };
    }

    // ✅ Normal case: just one filter
    return fetchWithToken(`${BASE_URL}/marketplace/maker/jobs?filter=${filter}`, token);
}

export function useJobs(filter: string) {
    return useQuery({
        queryKey: ['jobs', filter],
        queryFn: () => fetchJobs(filter),
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });
}
