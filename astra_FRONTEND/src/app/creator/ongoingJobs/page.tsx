'use client';
import { useState, useEffect } from 'react';
import CreatorSidebar from '../../components/creatorSidebar';
import CreatorNavbar from '../../components/creatorNavbar';
import JobsTabs from '../jobs/JobTabs';
import OngoingJobsGrid from '../../components/ongoingJobsGrid';
import { useJobs } from '../../hooks/useOngoingJobs';
import JobCardSkeleton from '@/app/components/JobCardSkeleton';

type JobFilter = 'applications' | 'ongoing' | 'completed' | 'all';

export default function Page() {
    const [activeTab, setActiveTab] = useState<JobFilter>('applications');

    // React Query hook to fetch jobs for the active tab
    const { data, isLoading, isError } = useJobs(activeTab);

// Map frontend tabs to backend 'status' values
const tabToStatusMap: Record<JobFilter, string[] | null> = {
  applications: ['not selected by creator', 'selected by creator', 'awaiting decision'], // all incoming applications
  ongoing: ['selected by creator'], // jobs in progress
  completed: ['withdrawn'], // or whatever your backend defines as completed
  all: null, // show everything
};

const statuses = tabToStatusMap[activeTab];
const jobsForTab = data?.data || [];

// const jobsForTab = statuses
//   ? data?.data?.filter((job: any) => statuses.includes(job.status)) || []
//   : data?.data || [];


    // Log backend response and filtered jobs for debugging
    useEffect(() => {
        console.log('Backend data:', data);
        console.log('Jobs for tab:', activeTab, jobsForTab);
    }, [data, activeTab, jobsForTab]);

    return (
        <div className="flex flex-col min-h-screen font-[ClashGrotesk-regular] pb-32">
            <CreatorNavbar />
            <div className="flex flex-1 flex-col lg:flex-row">
                <CreatorSidebar />
                <div className="flex-1 pt-6 px-4 sm:px-6 lg:pt-10 lg:px-16">
                    {/* Header */}
                    <h2 className="text-3xl font-semibold">Your Ongoing Jobs</h2>
                    <p className='text-xl'>Your current in going jobs are here.</p>

                    {/* Tabs */}
                    <JobsTabs
                        activeTab={activeTab}
                        onTabChange={(tab: JobFilter) => setActiveTab(tab)}
                    />

                    {/* Jobs Content */}
                    {/* {isLoading && <p>Loading...</p>} */}
                    {isLoading && (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 p-4 gap-6 max-w-[1440px] mx-auto">
        {[...Array(4)].map((_, i) => (
            <JobCardSkeleton key={i} />
        ))}
    </div>
)}
                    {isError && (
                        <p className="text-red-500">
                            Error loading jobs. Please refresh or login again.
                        </p>
                    )}
                    {!isLoading && !isError && (
                        <OngoingJobsGrid
                            jobs={jobsForTab}
                            onJobAction={() => {}}
                            activeTab={activeTab} // pass activeTab to show appropriate message
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
