'use client';

import useSWR from 'swr';
import { requestWithAuth } from './useJob'; // reuse your existing auth fetcher

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useProfile() {
    const { data, error, isLoading } = useSWR(
        `${API_BASE}/auth/profile`,
        requestWithAuth,
        {
            revalidateOnFocus: false,
            dedupingInterval: 1000 * 60, // cache for 1 min
        }
    );

    // Normalize profile object safely
    const profile = data?.data ?? null;
    const projects = profile?.projects ?? [];

    return {
        profile,
        projects,
        isLoading,
        isError: error,
    };
}
