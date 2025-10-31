import { useQuery } from '@tanstack/react-query';
import { useJobs } from './useOngoingJobs';

export function useAllJobs() {
    const { data: applicationsData } = useJobs('applications');
    const { data: ongoingData } = useJobs('ongoing');
    const { data: completedData } = useJobs('completed');

    // Merge all jobs into one array
    const allJobs = [
        ...(applicationsData?.data || []),
        ...(ongoingData?.data || []),
        ...(completedData?.data || []),
    ];

    return allJobs;
}
