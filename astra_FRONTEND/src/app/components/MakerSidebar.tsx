'use client';
import { WorkExperience } from '@/types/types';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Button from './button';

type MakerSidebarProps = {
    visible: boolean;
    onClose: () => void;
    currentExperience: WorkExperience;
    setCurrentExperience: React.Dispatch<React.SetStateAction<WorkExperience>>;
    onSave: (updated: WorkExperience | null) => void;
    isLoading: boolean;
};

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MakerSidebar({
    visible,
    onClose,
    currentExperience,
    setCurrentExperience,
    onSave,
    isLoading
}: MakerSidebarProps) {

    return (
        <>
            <>
                <div
                    className={`
                        fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out
                        ${visible ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                    `}
                    onClick={onClose}
                />
                <div
                    className={`
        fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out
        hidden sm:block
        ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        right-[calc(35.8%+12px)] lg:right-[calc(35.8%+12px)] md:right-[calc(60%+12px)] sm:right-[calc(80%+12px)]
    `}
                >
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full shadow-md border bg-white border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${visible ? 'rotate-0' : 'rotate-180'
                            }`} />
                    </button>
                </div>

                {/* <Image src="/Close arrow.svg" alt="Close" width={300} height={300} className="w-8 h-8bg-red-500 z-50" /> */}
                <div
                    className={`
                        fixed top-0 right-0 h-full bg-white shadow-lg z-50 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out
                        ${visible ? 'translate-x-0' : 'translate-x-full'}
                        w-full sm:w-[80%] md:w-[60%] lg:w-[35.8%]
                    `}
                >
                    <div className="flex items-center justify-between mb-6 text-center">
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                            <Image src="/sidebar-close-icon.svg" alt="Close" width={20} height={20} className="w-5 h-5" />
                        </button>
                        <h3 className="text-2xl text-center font-bold flex-1">Add Experience</h3>
                        <div className="w-9" />
                    </div>

                    <div className="space-y-4 text-left">
                        {/* Employer Name */}
                        <div className="pb-5">
                            <label className="block text-sm font-bold mb-4">Employer Name *</label>
                            <input
                                type="text"
                                value={currentExperience.employerName}
                                onChange={(e) =>
                                    setCurrentExperience((prev) => ({ ...prev, employerName: e.target.value }))
                                }
                                placeholder="What is the name of your employer?"
                                className="w-full px-3 py-2 border border-[#4F4F4F] rounded-3xl focus:outline-none"
                            />
                        </div>

                        {/* Job Title */}
                        <div className="pb-5">
                            <label className="block text-sm font-bold mb-4">Job Title *</label>
                            <input
                                type="text"
                                value={currentExperience.jobTitle}
                                onChange={(e) =>
                                    setCurrentExperience((prev) => ({ ...prev, jobTitle: e.target.value }))
                                }
                                placeholder="What is the title of your position?"
                                className="w-full px-3 py-2 border border-[#4F4F4F] rounded-3xl focus:outline-none"
                            />
                        </div>

                        {/* Start Date */}
                        <div className="pb-5">
                            <label className="block text-sm font-bold mb-4">Start Date</label>
                            <div className="flex space-x-2">
                                <select
                                    value={currentExperience.startMonth}
                                    onChange={(e) =>
                                        setCurrentExperience((prev) => ({ ...prev, startMonth: e.target.value }))
                                    }
                                    className="flex-1 px-3 bg-white py-2 border border-[#4F4F4F] rounded-3xl focus:outline-none"
                                >
                                    <option value="">Month</option>
                                    {months.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={currentExperience.startYear}
                                    onChange={(e) =>
                                        setCurrentExperience((prev) => ({ ...prev, startYear: e.target.value }))
                                    }
                                    placeholder="Year"
                                    className="flex-1 px-3 py-2 border border-[#4F4F4F] rounded-3xl focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-bold mb-4">End Date</label>
                            <div className="flex space-x-2">
                                <select
                                    value={currentExperience.endMonth}
                                    onChange={(e) =>
                                        setCurrentExperience((prev) => ({ ...prev, endMonth: e.target.value }))
                                    }
                                    disabled={currentExperience.isCurrentJob}
                                    className="flex-1 px-3 py-2 bg-white border border-[#4F4F4F] rounded-3xl focus:outline-none disabled:bg-gray-100"
                                >
                                    <option value="">Month</option>
                                    {months.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={currentExperience.endYear}
                                    onChange={(e) =>
                                        setCurrentExperience((prev) => ({ ...prev, endYear: e.target.value }))
                                    }
                                    placeholder="Year"
                                    disabled={currentExperience.isCurrentJob}
                                    className="flex-1 px-3 py-2 border border-[#4F4F4F] rounded-3xl focus:outline-none disabled:bg-gray-100"
                                />
                            </div>
                            <label className="flex items-center mt-4">
                                <input
                                    type="checkbox"
                                    checked={currentExperience.isCurrentJob}
                                    onChange={(e) =>
                                        setCurrentExperience((prev) => ({
                                            ...prev,
                                            isCurrentJob: e.target.checked,
                                            endMonth: e.target.checked ? '' : prev.endMonth,
                                            endYear: e.target.checked ? '' : prev.endYear,
                                        }))
                                    }
                                    className="mr-2"
                                />
                                <span className="text-sm">I currently work here</span>
                            </label>
                        </div>

                        {/* Job Description */}
                        <div className="pb-11">
                            <label className="block text-sm font-bold mb-4">Job Description</label>
                            <textarea
                                value={currentExperience.jobDescription}
                                onChange={(e) =>
                                    setCurrentExperience((prev) => ({ ...prev, jobDescription: e.target.value }))
                                }
                                placeholder="Write a short description about the work experience"
                                rows={4}
                                className="w-full max-h-96 px-3 py-2 border border-[#4F4F4F] rounded-lg focus:outline-none"
                            />
                        </div>

                        <Button
                            label={isLoading ? 'Loading...' : 'Add Experience'}
                            fullWidth={false}
                            disabled={isLoading}
                            className="rounded-xl mb-4 w-full"
                            onClick={() => {
                                if (currentExperience) {
                                    onSave(currentExperience);
                                }
                            }}
                        />

                    </div>
                </div>
            </>
        </>
    )
}