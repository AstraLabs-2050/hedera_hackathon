'use client';

import React from "react";
import CreatorSidebar from "../../../components/creatorSidebar";
import CreatorNavbar from "../../../components/creatorNavbar";
import Image from "next/image";
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function Page() {
    const router = useRouter();
    return (
        <div className="flex flex-col h-[100dvh] font-[ClashGrotesk-regular]">
            <CreatorNavbar />
            <div className="flex flex-1 flex-col lg:flex-row">
                <CreatorSidebar />

                {/* Main Content */}
                <div className="flex flex-col flex-1 py-6 lg:py-10">

                    {/* Header */}
                    <div className="flex sm:flex-row sm:items-center justify-between px-4 lg:px-8 border-b border-[#E5E5E5] pb-4 lg:pb-6 gap-4 sm:gap-0">
                        <div className="flex items-center gap-3">
                            <ChevronLeft
                                onClick={() => router.push('/creator/accountSettings')}
                                className="w-5 h-5" />
                            <h1 className="text-lg lg:text-[22px] font-semibold">Notifications</h1>
                        </div>
                        <button
                            onClick={() => router.push('/creator/dashboard')}
                            className="px-4 lg:px-6 py-2 rounded-full border border-[#D0D5DD] text-sm hover:bg-gray-50 transition sm:w-auto">
                            Back to dashboard
                        </button>
                    </div>

                    <div className="px-4 lg:px-8">

                        {/* Basic Information */}
                        <div className="pt-6 lg:pt-8 border-b border-b-[#E0E0E0] py-4">
                            <div className="max-w-full lg:max-w-[1024px]">
                                <h2 className="text-base font-semibold">Basic Information</h2>
                                <p className="text-sm text-[#515B6F] mt-1">
                                    This is notifications preferences that you can update anytime.
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-b border-[#E5E5E5]">
                            <div className='flex flex-col lg:justify-between lg:flex-row lg:max-w-[1024px] w-full'>
                                <div className="pr-8 nb-6 lg:mb-0">
                                    <h2 className="text-base font-semibold mb-2 w-full">Notifications</h2>
                                    <p className="text-[#515B6F]">Customize your preferred notification settings</p>
                                </div>

                                <div className="flex max-w-lg flex-col w-full">
                                    <label className="flex items-start gap-3 p-4 cursor-pointer w-full">
                                        <input
                                            type="checkbox"
                                            name="accountType"
                                            defaultChecked
                                            className="mt-1 accent-[#4640DE] w-6 h-6"
                                        />
                                        <div>
                                            <h3 className="font-medium">Applications</h3>
                                            <p className="text-sm text-gray-500 w-64">These are notifications for jobs that you have applied to</p>
                                        </div>
                                    </label>

                                    {/* Employer */}
                                    <label className="flex items-start gap-3 p-4 cursor-pointer w-full">
                                        <input
                                            type="checkbox"
                                            name="accountType"
                                            className="mt-1 accent-[#4640DE] w-6 h-6 checked:after:text-xs"
                                        />
                                        <div>
                                            <h3 className="font-medium">Jobs</h3>
                                            <p className="text-sm text-gray-500 w-64">
                                                These are notifications for job openings that suit your profile
                                            </p>
                                        </div>

                                    </label>

                                    <label className="flex items-start gap-3 p-4 cursor-pointer w-full">
                                        <input
                                            type="checkbox"
                                            name="accountType"
                                            className="mt-1 accent-[#4640DE] w-6 h-6"
                                        />
                                        <div>
                                            <h3 className="font-medium">Recommendations</h3>
                                            <p className="text-sm text-gray-500 w-64">
                                                These are notifications for personalized recommendations from our recruiters
                                            </p>
                                        </div>
                                    </label>

                                    <div className="my-6">
                                        <button className="bg-black text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-gray-900 transition w-full sm:w-56">
                                            Update Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}