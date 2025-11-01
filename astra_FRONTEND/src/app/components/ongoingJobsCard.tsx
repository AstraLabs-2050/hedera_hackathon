'use client';
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Job } from "../../types/job";
import Image from "next/image";
import Link from "next/link";
import JobCardSkeleton from "./JobCardSkeleton";

interface OngoingJobsCardProps {
    job: Job;
    onAction: (jobId: string, action: string) => void;
}

export default function OngoingJobsCard({ job, onAction }: OngoingJobsCardProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Safe date formatting
    const formattedAppliedOn = job.appliedOn
        ? format(new Date(job.appliedOn), "MMM d, yyyy")
        : "N/A";

    const formattedDueDate =
        job.dueDate && !isNaN(new Date(job.dueDate).getTime())
            ? format(new Date(job.dueDate), "MMM d, yyyy")
            : null;

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown on Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setDropdownOpen(false);
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);


const renderStatus = () => {
    if (job.status === "selected by creator" && job.dueDate) {
        const now = new Date();
        const due = new Date(job.dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        const isUrgent = diffDays <= 7;
        const color = isUrgent ? "#EB3173" : "#1D40C8"; // red if <= 7 days, else blue

        return (
            <span style={{ color, fontWeight: 500 }}>
                <strong>• Due on {new Date(job.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
            </span>
        );
    }

    // fallback for other statuses
    switch (job.status) {
        case "awaiting decision":
            return <span className="text-[#1D40C8] font-medium"><strong>• Awaiting decision</strong></span>;
        case "withdrawn":
            return <span className="text-[#4F4F4F]"><strong>• Withdrawn</strong></span>;
        case "not selected by creator":
            return <span className="text-[#EB3173]"><strong>• Not selected by Creator</strong></span>;
            case "selected by creator":
            return <span className="text-[#25c348]"><strong>• Selected by Creator</strong></span>;
        case "completed":
            return <span className="text-[#25c348]"><strong>• Completed</strong></span>;
        default:
            return null;
    }
};

    const isDisabled =
        job.status === "withdrawn" ||
        job.status === "completed" ||
        job.status === "not selected by creator" ||
        job.status === "awaiting decision";

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 p-4 gap-6 max-w-[1440px] mx-auto">
                {[...Array(4)].map((_, i) => (
                    <JobCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="relative flex flex-col gap-4 border border-[#E0E0E0] rounded-lg max-w-xl w-full p-4 shadow-sm hover:shadow-md transition">
            {/* <div className="mt-2 text-sm"></div> */}

            <div key={job.id} className="bg-white overflow-hidden w-full flex flex-col xl:flex-row gap-4 border-b border-b-[#BDBDBD] pb-4">
                {/* Image */}
                <div className="relative w-full mx-auto md:mx-0">
                    {job.image ? (
                        <Image
                            src={job.image || '/fashion-work1.png'}
                            alt={job.brandName || "Job image"}
                            width={200}
                            height={260}
                            className="rounded-2xl w-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-[260px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
                            No Image
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center gap-4 w-full">
                    <span className="inline-block mt-2 text-sm">
                    {renderStatus()}
                    </span>
                    <h3 className="text-sm font-semibold">{job.brandName || "Untitled Job"}</h3>

                    <div className="flex items-center gap-1">
                        <Image src="/USDC.svg" alt="USDC" width={16} height={16} />
                        <span className='text-sm'>{job.pay ?? "N/A"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Image src="/apparel.svg" alt="Stock" width={16} height={16} />
                        <span className='text-sm'>{job.stock ?? "N/A"}</span>
                    </div>


                    <Link
                        href={job.link || job.image || '#'}
                        target="_blank"
                        className="text-sm text-[#4285F4] underline"
                    >
                        {(job.link || job.image || 'No link available')
                            .slice(0, 31) + ((job.link || job.image)?.length > 31 ? '...' : '')}
                    </Link>



                    <p className="text-xs text-[#828282]">
                        Last Updated {job.lastUpdated ?? 'N/A'}
                    </p>

                    <div className='flex gap-4'>
                        <Link href={`/creator/jobs/${job.id}`}>
                            <button className="mt-2 bg-white border-2 border-black text-xs font-medium px-4 py-2 rounded-full hover:bg-gray-50 transition max-w-[114px]">
                                View Details
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <span>
                    <p className="text-xs pb-2">Applied on:</p>
                    <p className="text-base">
                        {job.dateTimeApplied
                            ? format(new Date(job.dateTimeApplied), "MMM d, yyyy")
                            : "N/A"}
                    </p>

                    {/* <p className="text-base">{job.dateTimeApplied}</p> */}
                </span>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setDropdownOpen(p => !p)}
                        className={`px-4 py-2 rounded transition-colors duration-200 ${isDisabled ? "opacity-25 cursor-not-allowed" : ""}`}
                        aria-haspopup="menu"
                        aria-expanded={dropdownOpen}
                        disabled={isDisabled}
                    >
                        <Image src="/options-icon.svg" alt="Options" width={5} height={5} />
                    </button>

                    {dropdownOpen && (
                        <div role="menu" className="absolute right-0 top-full w-60 bg-white shadow-lg rounded-lg border border-gray-200 z-20 origin-top-right">
                            <button
                                role="menuitem"
                                onClick={() => { onAction(job.id, "Withdraw"); setDropdownOpen(false); }}
                                className="flex gap-3 w-full text-left font-[ClashGrotesk-medium] text-[#EB3173] px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                <Image src='/Subtract.svg' alt='Subtract Icon' width={20} height={20} />
                                Withdraw Application
                            </button>
                            <button
                                role="menuitem"
                                onClick={() => { onAction(job.id, "Completed"); setDropdownOpen(false); }}
                                className="flex gap-3 w-full font-[ClashGrotesk-medium] text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                <Image src='/report.svg' alt='Report Icon' width={20} height={20} />
                                Report Job
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
