'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useJobs } from '../hooks/useJob';
import { useSavedJobs } from '../hooks/useSavedJobs';
import JobCardSkeleton from './JobCardSkeleton';

export default function JobCard({
    filterSavedOnly = false,
    showUnsaveButton = false,
    limit,
}: {
    filterSavedOnly?: boolean;
    showUnsaveButton?: boolean;
    limit?: number;
}) {
    const { jobs, isLoading, isError } = useJobs();
    const { savedJobIds, isJobSaved, toggleSaveJob } = useSavedJobs();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 p-4 gap-6 max-w-[1440px] mx-auto">
                {[...Array(4)].map((_, i) => (
                    <JobCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (isError) {
        return <p className="text-center text-red-500">Failed to load jobs.</p>;
    }

    const filteredJobs = filterSavedOnly
        ? jobs.filter((job: any) => savedJobIds.includes(job.id))
        : jobs;

    const jobsToRender = limit ? filteredJobs.slice(0, limit) : filteredJobs;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 p-4 gap-6 max-w-[1440px] mx-auto">
            {jobsToRender.map((job: any) => (
                <div
                    key={job.id}
                    className="bg-white rounded-2xl overflow-hidden border border-[#BDBDBD] w-full p-4 flex flex-col xl:flex-row md:items-center gap-4"
                >
                    {/* Image Section */}
                    <div className="relative w-full mx-auto md:mx-0">
                        <Image
                            src={job.image || '/genImage2.png'}
                            alt={job.brandName || 'Job'}
                            width={200}
                            height={260}
                            className="rounded-2xl w-full h-72 lg:h-64 xl:h-72"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center gap-3 w-full">
                        <span className="inline-block bg-[#CEFFD5] text-[#01B121] text-xs font-bold px-3 py-1 rounded-full w-fit">
                            {job.status === 'open' ? 'Published' : 'Closed'}
                        </span>

                        <h3 className="text-sm font-semibold">{job.brandName}</h3>

                        {/* Pay & Stock */}
                        <div className="flex items-center gap-1">
                            <Image src="/USDC.svg" alt="USDC" width={16} height={16} />
                            <span className="text-sm">{job.pay || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Image src="/apparel.svg" alt="Stock" width={16} height={16} />
                            <span className="text-sm">{job.stock || 'N/A'}</span>
                        </div>

                        <Link
                            href={job.link || '#'}
                            target="_blank"
                            className="text-sm text-[#4285F4] truncate underline"
                        >
                            {(job.link || job.image || 'No link available')
                                .slice(0, 31) + ((job.link || job.image)?.length > 31 ? '...' : '')}
                            {/* {job.link || job.image || 'No link available'} */}
                        </Link>

                        <p className="text-xs text-[#828282]">
                        Last Upated    {job.lastUpdated
                                ? new Date(job.lastUpdated).toLocaleDateString()
                                : 'N/A'}
                        </p>

                        <div className="flex gap-4">
                            <Link href={`/creator/jobs/${job.id}`}>
                                <button className="mt-2 bg-white border-2 border-black text-xs font-medium px-4 py-2 rounded-full hover:bg-gray-50 transition max-w-[114px]">
                                    View Details
                                </button>
                            </Link>

                            {isJobSaved(job.id) && showUnsaveButton && (
                                <button
                                    onClick={() => toggleSaveJob(job.id)}
                                    className="mt-2 bg-black text-white text-xs font-medium px-4 py-2 rounded-full transition max-w-[114px] "
                                >
                                    Unsave job
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
