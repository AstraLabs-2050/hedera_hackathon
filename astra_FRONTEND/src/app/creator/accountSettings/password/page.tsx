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
        <div className="flex flex-col min-h-screen font-[ClashGrotesk-regular]">
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
                            <h1 className="text-lg lg:text-[22px] font-semibold">Password & Security</h1>
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
                                    This is your login information that you can update anytime.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-b border-[#E5E5E5]">
                        <div className='flex flex-col lg:justify-between lg:flex-row lg:max-w-[1024px] w-full'>
                            <div className="pr-8 nb-6 lg:mb-0">
                                <h2 className="text-base font-semibold mb-2 w-full">Update Email</h2>
                                <p className="text-[#515B6F]">Update your email to make sure it is up to safe</p>
                            </div>

                            <div className="flex max-w-lg flex-col w-full">
                                    <h3 className="flex items-center gap-2 font-medium">
                                        jakegyll@email.com
                                        <Image src="/checker-icon.svg" alt="Checker Icon" width={20} height={20} />
                                    </h3>
                                    <p className="text-sm text-[#7C8493] mb-4">Your email address is verified.</p>

                                    <label className="block text-sm text-[#515B6F] font-medium mb-1">Update Email</label>
                                    <input
                                        type="email"
                                        className=" w-full border border-[#D0D5DD] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Enter your new email"
                                    />

                                    <div className="mt-6">
                                        <button className="bg-black text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-gray-900 transition w-full sm:w-44">
                                            Update Email
                                        </button>
                                    </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-b border-[#E5E5E5]">
                        <div className='flex flex-col lg:flex-row lg:justify-between max-w-full lg:max-w-[1024px] w-full'>
                            <div className="flex flex-col">
                                <h2 className="text-base font-semibold mb-6 w-full">New Password</h2>
                                <p className="text-[#515B6F]">Manage your password to make sure it is safe</p>
                            </div>

                            <div className="flex max-w-lg flex-col w-full">
                                    <label className="block text-sm text-[#515B6F] font-medium mb-1">Old Password</label>
                                    <input
                                        type="email"
                                        className=" w-full border border-[#D0D5DD] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Enter your new email"
                                    />
                                        <p className="text-sm text-[#7C8493]">Minimum 8 characters</p>

                                        <label className="block text-sm text-[#515B6F] font-medium mb-1 mt-8">New Password</label>
                                    <input
                                        type="email"
                                        className=" w-full border border-[#D0D5DD] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Enter your new password"
                                    />
                                        <p className="text-sm text-[#7C8493]">Minimum 8 characters</p>

                                    <div className="mt-6">
                                        <button className="bg-black text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-gray-900 transition w-full sm:w-44">
                                            Change Password
                                        </button>
                                    </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}