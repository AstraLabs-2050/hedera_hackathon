import React from "react";
import OngoingJobsCard from "./ongoingJobsCard";
import { Job } from "../../types/job";

interface OngoingJobsGridProps {
    jobs?: Job[];
    onJobAction: (jobId: string, action: string) => void;
    activeTab: string;
}

const OngoingJobsGrid: React.FC<OngoingJobsGridProps> = ({ jobs = [], onJobAction, activeTab }) => {
    if (jobs.length === 0) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <p className="text-gray-500 text-center text-lg">
                    No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Jobs.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-6">
            {jobs.map((job) => (
                <OngoingJobsCard key={job.id} job={job} onAction={onJobAction} />
            ))}
        </div>
    );
};

export default OngoingJobsGrid;
