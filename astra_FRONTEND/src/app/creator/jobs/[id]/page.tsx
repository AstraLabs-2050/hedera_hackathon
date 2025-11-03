'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CreatorNavbar from '../../../components/creatorNavbar';
import { useJobs } from '../../../hooks/useJob';
import { useSavedJobs } from '../../../hooks/useSavedJobs';
import { useClient } from '../../../hooks/useClientDetails';
import ClientCardSkeleton from '@/app/components/ClientCardSkeleton';
import JobDetailSkeleton from '@/app/components/JobDetailSkeleton';

type Params = { params: { id: string } };

export default function JobDetailPage({ params }: Params) {
    const [open, setOpen] = useState(false);
    const [proposedAmount, setProposedAmount] = useState<string>('');
    const [minimumAmount, setMinimumAmount] = useState<string>('');
    const { jobs, isLoading } = useJobs();
    const { id } = useParams();
    const { client, isLoading: clientLoading } = useClient(id as string);
    const { isJobSaved, toggleSaveJob } = useSavedJobs();

    const isSaved = isJobSaved(id as string);
    const job = jobs.find((j) => j.id === params.id);

//     if (!jobs || jobs.length === 0) {
//   return <JobDetailSkeleton />;
// }

if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <JobDetailSkeleton/>
    </div>
  );
}
    if (!job) return notFound();



    return (
        <div className="min-h-screen w-full bg-white font-[ClashGrotesk-regular]">
            <CreatorNavbar />
            <div className="px-6 sm:px-8 lg:px-12">
                <Link
                    href="/creator/dashboard"
                    className="flex mt-8 sm:mt-12 px-4 items-center text-base sm:text-lg text-[#4F4F4F] font-bold pb-10 sm:pb-0"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Go Back
                </Link>

                <div className="flex flex-col xl:flex-row justify-between gap-10 xl:gap-20 mx-auto px-2 sm:px-4 py-6">
                    {/* Left side */}
                    <div className="flex flex-col gap-4 flex-1">
                        <h1 className="text-2xl mt-4 sm:mt-12 mb-6">
                            {job.brandName ?? 'Unnamed Brand'}
                        </h1>

                        <p className="text-[#4F4F4F] text-base sm:text-lg mb-6 max-w-3xl">
                            {job.jobDescription ?? 'No description provided.'}
                        </p>

                        <div className="flex flex-col justify-start gap-10 mb-6">
                            <div className="flex flex-col md:flex-row md:gap-16 gap-6">
                                <div className="flex-1">
                                    <p className="text-base text-[#4F4F4F]">AI Prompt</p>
                                    <p className="font-medium text-lg">{job.aiPrompt ?? 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-5 p-2 lg:border-2 lg:border-dashed max-w-4xl">
                            {client?.images && client.images.length > 0 ? (
                                client.images.map((img: string, index: number) => (
                                    <div key={index} className="overflow-hidden">
                                        <Image
                                            src={img}
                                            alt={`Look ${index + 1}`}
                                            width={204}
                                            height={236}
                                            className="object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                [...Array(4)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden bg-gray-200 h-[236px] w-[204px] rounded"
                                    />
                                ))
                            )}
                        </div>

                        {/* Payment Terms */}
                        <div className="mt-12 border border-[#E0E0E0] rounded-2xl bg-white overflow-hidden max-w-full lg:max-w-4xl">
                            <div className="flex items-center justify-between p-6 border-b border-[#E0E0E0]">
                                <h3 className="text-base font-medium">Set Payment Terms</h3>
                                <button onClick={() => setOpen(!open)} aria-label="Toggle Payment Terms">
                                    {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${open ? 'max-h-[500px] p-6' : 'max-h-0 p-0'
                                    }`}
                            >
                                <div className="flex flex-col gap-16 py-12">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                                        <div className="flex-1">
                                            <p className="text-base font-medium mb-1">
                                                How much would you like to charge for this job?
                                            </p>
                                            <p className="text-sm text-[#4F4F4F]">
                                                Total amount the client will see on your proposal
                                            </p>
                                        </div>
                                        <input
                                            type="number"
                                            value={proposedAmount}
                                            onChange={(e) => setProposedAmount(e.target.value)}
                                            placeholder="$ 0.00"
                                            className="appearance-none w-full md:max-w-xs border border-[#BDBDBD] rounded-full px-5 py-3 text-sm focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex-1">
                                            <p className="text-base font-medium mb-1">
                                                What is your minimum amount for negotiation?
                                            </p>
                                            <p className="text-sm text-[#4F4F4F]">
                                                Give the client the minimum amount you can accept for this job.
                                            </p>
                                        </div>
                                        <input
                                            type="number"
                                            value={minimumAmount}
                                            onChange={(e) => setMinimumAmount(e.target.value)}
                                            placeholder="$ 0.00"
                                            className="appearance-none w-full md:max-w-xs border border-[#BDBDBD] rounded-full px-5 py-3 text-sm focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side: About the Client */}
                    <div className="flex flex-col gap-1 border rounded-xl p-6 space-y-6 max-w-full h-fit xl:max-w-xs mt-10 lg:mt-14">
                        {clientLoading ? (
                            <ClientCardSkeleton />
                        ) : client ? (
                            <>
                                <div className="flex flex-col gap-8 xl:items-start xl:text-left">
                                    <p className="text-base">About the Client</p>
                                    {client.clientAvatar ? (
                                        <Image
                                            src={client.clientAvatar}
                                            alt="Client Avatar"
                                            width={70}
                                            height={70}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-[50px] h-[50px] rounded-full bg-[#F8F8F8] flex items-center justify-center">
                                            <Image
                                                src="/user-fill.png"
                                                alt="Profile-placeholder"
                                                width={24}
                                                height={24}
                                                className="w-[30px] h-[30px]"
                                            />
                                        </div>
                                    )}
                                    <p className="text-base font-medium">{client.clientName ?? 'Unknown Client'}</p>
                                </div>

                                <p className="text-base text-[#4F4F4F]">
                                    {client.clientBio
                                        ? client.clientBio.split(' ').length > 40
                                            ? client.clientBio.split(' ').slice(0, 40).join(' ') + '...'
                                            : client.clientBio
                                        : 'No client description provided.'}
                                </p>

                                <div className="text-base flex flex-col md:flex-row gap-10 lg:text-left xl:flex-col xl:gap-4">
                                    <div className="flex flex-col gap-1">
                                        <p>Date posted:</p>
                                        <span className="text-[#4F4F4F]">
                                            {client.datePosted ? client.datePosted.slice(0, 10) : 'Not available'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p>Proposed due date:</p>
                                        <span className="text-[#4F4F4F]">
                                            {client.dueDate ? client.dueDate.slice(0, 10) : 'Not specified'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p>Failed to load client details.</p>
                        )}

                        <div className="flex flex-col md:flex-row xl:flex-col gap-4">
                            <Link
                                href={{
                                    pathname: `/creator/jobs/${id}/apply`,
                                    query: {
                                        proposedAmount: proposedAmount || '0',
                                        minimumNegotiableAmount: minimumAmount || '0',
                                    },
                                }}
                                className="w-full"
                            >
                                <button className="flex items-center justify-center gap-3 w-full bg-black text-white font-medium rounded-full py-3">
                                    <Image src="/send-app-icon.svg" alt="Send icon" width={20} height={20} />
                                    Send Application
                                </button>
                            </Link>

                            <button
                                onClick={() => toggleSaveJob(id as string)}
                                className="flex items-center justify-center gap-3 w-full border border-black text-black font-medium py-3 rounded-full"
                            >
                                <Image src="/save-job-icon.svg" alt="Save icon" width={20} height={20} />
                                {isSaved ? 'Unsave Job' : 'Save Job'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}