'use client';

import { ArrowLeft } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function JobDetailSkeleton() {
    return (
        <div className="min-h-screen w-full bg-white font-[ClashGrotesk-regular]">
            {/* Navbar placeholder */}
            <div className="h-16 bg-gray-100" />

            <div className="px-6 sm:px-8 lg:px-12">
                {/* Back link */}
                <div className="flex mt-8 sm:mt-12 px-4 items-center text-base sm:text-lg text-[#4F4F4F] font-bold pb-10 sm:pb-0">
                    <ArrowLeft size={18} className="mr-1" />
                    Go Back
                </div>

                <div className="flex flex-col xl:flex-row justify-between gap-10 xl:gap-20 mx-auto px-2 sm:px-4 py-6">
                    {/* Left side skeleton */}
                    <div className="flex flex-col gap-4 flex-1">
                        <Skeleton height={32} width={200} className="mt-4 sm:mt-12 mb-6" />
                        <Skeleton count={3} className="mb-6" />

                        <div className="flex flex-col gap-10 mb-6">
                            <Skeleton height={20} width={150} />
                            <Skeleton height={20} width={300} />
                        </div>

                        {/* Client images placeholder */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-5 p-2 lg:border-2 lg:border-dashed max-w-4xl">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} height={236} width={204} />
                            ))}
                        </div>

                        {/* Payment terms skeleton */}
                        <div className="mt-12 border border-[#E0E0E0] rounded-2xl bg-white overflow-hidden max-w-full lg:max-w-4xl p-6">
                            <Skeleton height={24} width={200} className="mb-6" />
                            <Skeleton height={20} count={3} />
                        </div>
                    </div>

                    {/* Right side skeleton */}
                    <div className="flex flex-col gap-6 border rounded-xl p-6 space-y-6 max-w-full h-fit xl:max-w-xs mt-10 lg:mt-14">
                        <Skeleton circle height={70} width={70} className="mx-auto" />
                        <Skeleton height={20} width={150} className="mx-auto" />
                        <Skeleton height={60} />
                        <Skeleton height={60} />
                    </div>
                </div>
            </div>
        </div>
    );
}
