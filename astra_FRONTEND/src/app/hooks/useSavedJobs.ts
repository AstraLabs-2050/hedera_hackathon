'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { requestWithAuth } from './useJob';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useSavedJobs() {
    const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

    // Load localStorage jobs instantly
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        setSavedJobIds(stored);
    }, []);

    // Fetch saved jobs from backend
    const { data, error, mutate, isLoading } = useSWR(
        `${API_BASE}/marketplace/maker/saved-jobs`,
        async (url) => {
            console.log("📡 Fetching saved jobs from backend…", url);
            const res = await requestWithAuth(url);
            console.log("✅ Jobs fetched successfully from backend:", res.data ?? res);
            return res;
        },
        { revalidateOnFocus: true }
    );

    // Accept multiple response shapes
    const savedJobs = Array.isArray(data) ? data : data?.data ?? data?.jobs ?? [];

    // Helper: check if job is saved
    const isJobSaved = (id: string) => savedJobIds.includes(id);

    // Save/Unsave toggle
    const toggleSaveJob = async (id: string) => {
        let updated: string[];
        if (savedJobIds.includes(id)) {
            updated = savedJobIds.filter((jobId) => jobId !== id);
            setSavedJobIds(updated);
            localStorage.setItem('savedJobs', JSON.stringify(updated));

            console.log(`🗑️ Unsave job locally: ${id}`);
            try {
                const res = await requestWithAuth(`${API_BASE}/marketplace/jobs/${id}/unsave`, {
                    method: 'DELETE',
                });
                console.log("🗑️ Job unsaved successfully on backend:", res.data ?? res);
                mutate(); // refresh saved jobs list
            } catch (err) {
                console.error("❌ Failed to unsave on backend:", err);
            }
        } else {
            updated = [...savedJobIds, id];
            setSavedJobIds(updated);
            localStorage.setItem('savedJobs', JSON.stringify(updated));

            console.log(`💾 Save job locally: ${id}`);
            try {
                const res = await requestWithAuth(`${API_BASE}/marketplace/jobs/${id}/save`, {
                    method: 'POST',
                });
                console.log("✅ Job saved successfully on backend:", res.data ?? res);
                mutate(); // refresh saved jobs list
            } catch (err) {
                console.error("❌ Failed to save on backend:", err);
            }
        }
    };

    return {
        savedJobIds,
        savedJobs,
        isJobSaved,
        toggleSaveJob,
        isLoading,
        isError: error,
    };
}


// 'use client';
// import { useState, useEffect } from 'react';

// export function useSavedJobs() {
//     const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

//     useEffect(() => {
//         const stored = JSON.parse(localStorage.getItem('savedJobs') || '[]');
//         setSavedJobIds(stored);
//     }, []);

//     const isJobSaved = (id: string) => savedJobIds.includes(id);

//     const toggleSaveJob = (id: string) => {
//         const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
//         let updated;

//         if (saved.includes(id)) {
//             updated = saved.filter((jobId: string) => jobId !== id);
//         } else {
//             updated = [...saved, id];
//         }

//         localStorage.setItem('savedJobs', JSON.stringify(updated));
//         setSavedJobIds(updated);
//     };

//     return { savedJobIds, isJobSaved, toggleSaveJob };
// }
