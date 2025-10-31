'use client';

import useSWR from 'swr';
import { requestWithAuth } from './useJob';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useClient(jobId: string) {
    const { data, error, isLoading } = useSWR(
        jobId ? `${API_BASE}/marketplace/jobs/${jobId}` : null,
        requestWithAuth,
        {
            revalidateOnFocus: false,
            dedupingInterval: 1000 * 60,
        }
    );

    // Log raw backend response
    if (data) console.log('🟢 Raw job details:', data);
    if (error) console.error('🔴 Error fetching client data:', error);

    // Map the client info from creator
    const client = data?.creator
        ? {
            clientName: data.creator.fullName ?? 'Unknown Client',
            clientEmail: data.creator.email ?? 'No email',
            clientAvatar: data.profilePicture, // default placeholder
            clientBio: data.description, // backend has no bio yet
            datePosted: data.createdAt ?? null,
            dueDate: data.deadline ?? null,
            images: data.referenceImages,
        }
        : null;

    return {
        client,
        isLoading,
        isError: error,
    };
}
