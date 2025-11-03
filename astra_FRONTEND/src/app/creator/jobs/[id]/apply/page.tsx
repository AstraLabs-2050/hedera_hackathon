'use client';

import React, { useState } from 'react';
import Navbar from '../../../../components/navbar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useJobs } from '../../../../hooks/useJob';
import { useProfile } from '../../../../hooks/useprofile';
import Button from '../../../../components/button';
import Image from 'next/image';
import ProjectCardSkeleton from '../../../../components/ProjectCardSkeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { requestWithAuth } from '../../../../hooks/useJob';
import { Calendar } from 'lucide-react';


type Params = { params: { id: string } };

export default function SendApplicationPage({ params }: Params) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [portfolioLink, setPortfolioLink] = useState('');
    const [timeline, setTimeline] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');

    const { jobs } = useJobs();
    const job = jobs.find((job) => job.id === params.id);

    const { projects, isLoading: profileLoading } = useProfile();
    const searchParams = useSearchParams();
    const router = useRouter();

    const proposedAmount = searchParams.get('proposedAmount');
    const minimumAmount = searchParams.get('minimumNegotiableAmount');

    const handleProjectSelect = (id: string) => {
        setSelectedProject(id === selectedProject ? '' : id);
    };

    // Step 1 → Open confirmation modal
    const handleSubmit = () => {
        setShowModal(true);
    };

    // Step 2 → Actually POST to backend
    // Step 2 → Actually POST to backend
    const handleConfirm = async () => {
        if (!job?.id) return;
        setIsLoading(true);
        setError('');

        const payload = {
            portfolioLinks: portfolioLink ? [portfolioLink] : [],
            selectedProjects: selectedProject ? [selectedProject] : [],
            proposedAmount: proposedAmount ? Number(proposedAmount) : null,
            minimumNegotiableAmount: minimumAmount ? Number(minimumAmount) : null,
            timeline: timeline,
        };

        try {
            await requestWithAuth(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/jobs/${job.id}/apply`,
                {
                    method: 'POST',
                    body: JSON.stringify(payload),
                }
            );

            // ✅ success → go to confirm page
            router.push(`/creator/jobs/${job.id}/confirm`);
        } catch (err: any) {
            console.error('Application submission failed:', err);

            // cleanly display backend message
            let msg = 'Something went wrong. Try again.';
            if (err.response?.message) {
                msg = err.response.message;
            } else if (typeof err.message === 'string') {
                msg = err.message;
            }

            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#FAFAFA] pb-8 min-h-screen">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 bg-white mb-16 rounded-2xl font-[ClashGrotesk-regular]">
                {/* header */}
                <div className="flex items-center justify-between mb-8 px-6">
                    <Link
                        href={`/creator/jobs/${job?.id}`}
                        className="flex items-center text-base font-bold mb-10 md:mb-0 -mr-9 -mt-16 md:-mt-0 md:-mr-0"
                    >
                        <ArrowLeft className="md:mr-2" size={18} /> Go Back
                    </Link>
                    <h1 className="text-3xl font-bold mb-4 text-center">Send Application</h1>
                    <div className="w-8 md:w-16"></div>
                </div>

                {/* projects */}
                <div className="flex justify-center">
                    <div className="space-y-6">
                        <p className="text-center mb-4 text-lg">
                            Select project(s) to share with creator
                        </p>

                        {profileLoading ? (
                            <div className="space-y-6">
                                {[...Array(2)].map((_, i) => (
                                    <ProjectCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <p className="text-center text-gray-500">No projects uploaded yet.</p>
                        ) : (
                            projects.map((project: any) => (
                                <div
                                    key={project.id}
                                    className={`max-w-lg border rounded-xl p-4 transition cursor-pointer ${selectedProject === project.id
                                        ? 'border-black'
                                        : 'border-gray-200'
                                        }`}
                                    onClick={() => handleProjectSelect(project.id)}
                                >
                                    <div className="flex justify-between items-center mb-3 border-b border-b-[#F2F2F2]">
                                        <h2 className="font-medium text-lg">{project.title}</h2>
                                        {selectedProject === project.id && (
                                            <Image
                                                src="/check-icon.svg"
                                                alt="Check icon"
                                                width={24}
                                                height={24}
                                            />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(project.images ?? []).map((src: string, i: number) => (
                                            <div
                                                key={i}
                                                className="aspect-[4/3] rounded-md overflow-hidden bg-gray-100"
                                            >
                                                <Image
                                                    src={src}
                                                    alt="Project thumbnail"
                                                    width={225}
                                                    height={199}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* portfolio link */}
                <div className="mt-10 flex justify-center">
                    <div className="w-full max-w-xl">
                        <label htmlFor="portfolio" className="text-sm font-medium mb-2 block">
                            Portfolio link
                        </label>
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 px-4">
                            <Image src="/portfolio-icon.svg" alt="icon" width={20} height={20} />
                            <input
                                type="url"
                                id="portfolio"
                                placeholder="Enter your portfolio link"
                                className="w-full outline-none text-sm bg-transparent"
                                value={portfolioLink}
                                onChange={(e) => setPortfolioLink(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* timeline */}
                <div className="mt-6 flex justify-center">
                    <div className="w-full max-w-xl">
                        <label htmlFor="timeline" className="text-sm font-medium mb-2 block">
                            Timeline
                        </label>
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 px-4">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            {/* <Image src="/calendar-icon.svg" alt="icon" width={20} height={20} /> */}
                            <input
                                type="text"
                                id="timeline"
                                placeholder="e.g. 2 weeks"
                                className="w-full outline-none text-sm bg-transparent"
                                value={timeline}
                                onChange={(e) => setTimeline(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* submit button */}
                <div className="mt-8">
                    <Button
                        label="Send Application"
                        onClick={handleSubmit}
                        fullWidth={true}
                        className="rounded-xl w-full max-w-md mx-auto"
                    />
                </div>
            </div>

            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"></div>

                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="bg-white rounded-2xl p-6 max-w-lg w-full text-center shadow-lg">
                            <div className="mb-4">
                                <Image
                                    src="/modal-envelope.png"
                                    alt="Envelope Icon"
                                    width={85}
                                    height={85}
                                    className="mx-auto"
                                />
                            </div>

                            <h2 className="text-xl text-center mb-4">
                                You are sending an Application <br /> for this Job.
                            </h2>
                            <p className="text-base text-[#4F4F4F] mb-6">
                                A job will be created, and the creator will reach out shortly.
                            </p>

                            {error && <p className="text-red-500 mb-4">{error}</p>}

                            <div className="flex justify-between gap-4 mb-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-2 rounded-full border border-black text-black font-medium"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="w-full py-2 rounded-full bg-black text-white font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Submitting...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
