'use client';

import Image from 'next/image';
import { useState } from 'react';
import CreatorSidebar from '../../../components/creatorSidebar';
import CreatorNavbar from '../../../components/creatorNavbar';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; 

export default function ProfileSettings() {
        const router = useRouter();
    const [profileImage, setProfileImage] = useState('/profilePicture.png');

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

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
                            <h1 className="text-lg lg:text-[22px] font-semibold">Profile Settings</h1>
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
                                    This is your personal information that you can update anytime.
                                </p>
                            </div>
                        </div>

                        {/* Profile Photo */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 pb-8 border-b border-[#E5E5E5] gap-6">
                            <div className="flex flex-col md:flex-row md:items-center max-w-full lg:max-w-[1024px] w-full gap-6">
                                <div className="flex-1 items-center justify-center">
                                    <h3 className='text-lg font-bold text-center lg:text-left'>Profile Photo</h3>
                                    <p className="text-sm text-[#515B6F] md:max-w-[200px] text-center lg:text-left">
                                        This image will be shown publicly as your profile picture, it will help recruiters recognize you!
                                    </p>
                                </div>
                                <div className='flex flex-col sm:flex-row items-center justify-center gap-6'>
                                    {profileImage ? (
                                        <Image
                                            src={profileImage}
                                            width={120}
                                            height={120}
                                            alt="Profile"
                                            className="rounded-full object-cover self-center"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-20 h-20 text-[#EBEBEB]"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Upload Box */}
                                    <label
                                        htmlFor="upload"
                                        className="flex flex-col items-center justify-center bg-[#F8F8FD] w-full sm:w-[367px] h-[140px] border-2 border-dashed border-black rounded-lg cursor-pointer hover:border-gray-400 transition"
                                    >
                                        <Image src='/icon.svg' alt='Upload Icon' width={28} height={20}/>
                                        <span className="text-sm text-[#7C8493] mt-2 font-medium">
                                            Click to replace
                                        </span>
                                        <span className="text-xs text-[#7C8493] mt-1 text-center">
                                            SVG, PNG, JPG or GIF (max. 400 × 400px)
                                        </span>
                                        <input
                                            id="upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="pt-8 pb-8 border-b border-[#E5E5E5]">
                            <div className='flex flex-col lg:flex-row max-w-full lg:max-w-[1024px] w-full'>
                                <h2 className="text-base font-semibold mb-6 w-full">Personal Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    {[
                                        { label: 'Full Name', type: 'text', value: 'Jake Gyll', full: true },
                                        { label: 'Phone Number', type: 'tel', value: '+44 1245 572 135' },
                                        { label: 'Email', type: 'email', value: 'Jakegyll@gmail.com' },
                                        { label: 'Date of Birth', type: 'date', value: '1987-08-09' },
                                    ].map((field, idx) => (
                                        <div
                                            key={idx}
                                            className={field.full ? 'md:col-span-2' : ''}
                                        >
                                            <label className="block text-sm text-[#515B6F] font-medium mb-1">
                                                {field.label} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type={field.type}
                                                defaultValue={field.value}
                                                className="w-full border border-[#D0D5DD] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                    ))}

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Gender <span className="text-red-500">*</span>
                                        </label>
                                        <select className="w-full border border-[#D0D5DD] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Type */}
                        <div className="flex flex-col lg:flex-row lg:justify-between xl:justify-normal xl:gap-64 gap-6 pt-8 pb-8 border-b border-[#E5E5E5]">
                            <div className='flex flex-col'>
                                <h2 className="text-base font-semibold mb-3">Account Type</h2>
                                <p className=''>You can update your account type</p>
                            </div>
                            <div className="flex flex-col md:flex-row xl:flex-col gap-6">
                                {/* Job Seeker */}
                                <label className="flex items-start gap-3 p-4 cursor-pointer w-full">
                                    <input
                                        type="radio"
                                        name="accountType"
                                        defaultChecked
                                        className="mt-1 accent-[#4640DE]"
                                    />
                                    <div>
                                        <h3 className="font-medium">Job Seeker</h3>
                                        <p className="text-sm text-gray-500">Looking for a job</p>
                                    </div>
                                </label>

                                {/* Employer */}
                                <label className="flex items-start gap-3 p-4 cursor-pointer w-full">
                                    <input
                                        type="radio"
                                        name="accountType"
                                        className="mt-1 accent-[#4640DE]"
                                    />
                                    <div>
                                        <h3 className="font-medium">Employer</h3>
                                        <p className="text-sm text-gray-500">
                                            Hiring, sourcing candidates, or posting a jobs
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex flex-col sm:flex-row justify-between mt-6 px-4 lg:px-12 gap-4">
                        <div className='hidden sm:block w-9'></div>
                        <button className="bg-black text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-gray-900 transition w-full sm:w-60">
                            Save Profile
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
