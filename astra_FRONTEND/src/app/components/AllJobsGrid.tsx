import React from 'react';
import OngoingJobsGrid from '../components/ongoingJobsGrid';
import { useAllJobs } from '../hooks/useAllJobs';

interface AllJobsGridProps {
    onJobAction: (jobId: string, action: string) => void;
}

const AllJobsGrid: React.FC<AllJobsGridProps> = ({ onJobAction }) => {
    const allJobs = useAllJobs();

    return (
        <OngoingJobsGrid
            jobs={allJobs}
            onJobAction={onJobAction}
            activeTab="all"
        />
    );
};

export default AllJobsGrid;
