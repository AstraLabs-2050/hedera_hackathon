'use client';

import { useState, useCallback } from 'react';
import ProgressHeader from '../ProgressHeader';
import ProfileImageUpload from '../ProfileImageUpload';
import LocationSelect from '../LocationSelect';
import Input from '../input';
import TagInput from '../TagInput';
import CategoryPicker from '../CategoryPicker';
import Button from '../button';
import Image from 'next/image';
import MakerSidebar from '../MakerSidebar';
import type { UploadedWork, WorkExperience, FormData } from '@/types/types';
import ProjectUploadSidebar from '../ProjectUploadSidebar';
import toast from 'react-hot-toast';

type Step7Props = {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: () => void;
    onBack: () => void;
};

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Step7({
    formData,
    setFormData,
    onNext,
    onBack,
}: Step7Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [currentExperience, setCurrentExperience] = useState<WorkExperience>({
        id: '',
        employerName: '',
        jobTitle: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        jobDescription: '',
        isCurrentJob: false
    });

    const [showProjectSidebar, setShowProjectSidebar] = useState(false);

    const handleUploadNewWork = useCallback((newWork: UploadedWork) => {
        setFormData(prev => ({
            ...prev,
            uploadedWorks: [...prev.uploadedWorks, newWork],
        }));
        setShowProjectSidebar(false);
    }, [setFormData]);


    const handleEditExperience = (exp: WorkExperience) => {
        setCurrentExperience(exp);
        setShowSidebar(true);
    };

    const handleSaveExperience = (updated: WorkExperience | null) => {
        if (!updated) return;

        const exists = formData.workExperiences.some((exp) => exp.id === updated.id);

        const updatedExperiences = exists
            ? formData.workExperiences.map((exp) =>
                exp.id === updated.id ? updated : exp
            )
            : [...formData.workExperiences, updated];

        setFormData((prev) => ({
            ...prev,
            workExperiences: updatedExperiences,
        }));

        setShowSidebar(false);
    };

    // const formatToBackend = (dateString: string) => {
    //     const [day, month, year] = dateString.split('/');
    //     return `${year}-${month}-${day}`;
    // };

    const completeProfileSubmission = async () => {
        console.log("✅ COMPLETE PROFILE PAYLOAD:");

        const payload = new FormData();

        // ✅ Basic info
        payload.append("profilePicture", formData.profilePicture);
        payload.append("location", formData.location);
        payload.append("category", formData.categories[0] || "");
        payload.append("skills", JSON.stringify(formData.skills));


        // ✅ Government ID
        if (Array.isArray(formData.personalIdFiles)) {
            formData.personalIdFiles.forEach((file: File) => {
                payload.append("governmentIdImages", file);
            });
        } else if (formData.personalIdFiles instanceof File) {
            payload.append("governmentIdImages", formData.personalIdFiles);
        }

        payload.append("nameOnId", formData.personalIdName);
        payload.append("idCountryOfIssue", formData.personalIdCountry);
        payload.append("idExpiryDate", formData.personalIdExpiry);

        // ✅ Business Info
        if (formData.isBusiness === "yes") {
            payload.append("businessCertificateImage", formData.businessCertFile);
            payload.append("businessName", formData.businessName);
            payload.append("taxRegistrationNumber", formData.taxRegistrationNumber);
            payload.append("businessCountryOfRegistration", formData.registrationCountry);
            payload.append("businessType", formData.businessType);
        }

        // ✅ Experience
        payload.append("workExperience", JSON.stringify(formData.workExperiences));

        // ✅ Projects
        payload.append("projects", JSON.stringify(formData.uploadedWorks));

        // ✅ Project Images (as a flat list under 'projectImages')
        formData.uploadedWorks.forEach((work) => {
            work.images.forEach((image) => {
                payload.append("projectImages", image);
            });
        });

        console.log("✅ FormData payload built (submitting now).");
        console.log("✅ FormData payload built (submitting now).");

        // 🔍 DEBUG: Log all FormData key-value pairs
        console.log("⬇️ FormData entries being sent:");
        for (let pair of payload.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }


        try {
            setIsLoading(true);

            // ✅ Get JWT token from localStorage
            const token = localStorage.getItem("jwt_token");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/complete-profile`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // ⛔ Do NOT manually set Content-Type here
                },
                body: payload,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("❌ Submission failed:", errorText);
                toast.error("Submission failed. Please check your inputs and try again.");
                return;
            }

            console.log("✅ Profile submitted successfully");
            toast.success("Profile submitted successfully!");
            onNext(); // Move to confirmation screen

        } catch (error) {
            console.error("❌ Submission error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };




    return (
        <div className='max-w-6xl w-full bg-white flex flex-col justify-center items-center'>
            <ProgressHeader step={7} onBack={onBack} />
            <div className="w-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

                <h1 className="text-3xl sm:text-[28px] md:text-[32px] font-semibold text-center mt-6 mb-8">
                    Review your details
                </h1>

                {/* Profile Image */}
                <div className="text-center mb-8">
                    <ProfileImageUpload
                        profilePicture={formData.profilePicture}
                        onChange={(file) => setFormData((prev) => ({ ...prev, profilePicture: file }))}
                    />
                </div>

                {/* Full Name + Email */}
                <div className=" flex flex-col gap-2 space-y-4 mb-6 w-full">
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="" className='text-xl'>Full Name</label>
                        <Input
                            placeholder="Full Name"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                            className='rounded-lg w-full'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label htmlFor="" className='text-xl'>Email address</label>
                        <Input
                            placeholder="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            className='rounded-lg w-full'
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                    <LocationSelect
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    />
                </div>

                {/* Categories */}
                <div className="mb-6 text-left">
                    <label className="block text-lg sm:text-xl font-medium mb-4 sm:mb-6">
                        What category best suits you?
                    </label>

                    {/* <TagInput
                        label="What category best suits you?"
                        skills={formData.categories} // stays a string[]
                        setSkills={(updated) => setFormData((prev) => ({ ...prev, categories: updated }))}
                    /> */}

                    <CategoryPicker
                        category={formData.categories[0] || ""}
                        setCategory={(cat) => setFormData((prev) => ({ ...prev, categories: [cat] }))}
                        options={["Freelance Tailor", "Small Scale Manufacturer", "Large Scale Manufacturer"]}
                    />


                </div>

                {/* Skills */}
                <div className="mb-6 text-left">
                    <TagInput
                        label="What are your skills?"
                        skills={formData.skills}
                        setSkills={(updated) => setFormData((prev) => ({ ...prev, skills: updated }))}
                    />
                </div>

                {/* Work Experience */}
                <div className="flex flex-col items-center justify-center px-4 w-full mt-8">
                    <h2 className="w-full text-left text-lg font-bold p-4 uppercase">
                        Your Work Experience
                    </h2>

                    <div className="space-y-4 w-full px-4 mb-4">
                        {formData.workExperiences.map((exp, index) => (
                            <div
                                key={exp.id}
                                className="w-full border border-[#E0E0E0] p-4 rounded-lg text-sm bg-[#F6F6F6]"
                            >
                                <div className="flex justify-between mb-1 w-full">
                                    <p className="font-semibold">
                                        {exp.jobTitle} - {exp.employerName}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            title="Edit"
                                            onClick={() => handleEditExperience(exp)}
                                        >
                                            <Image
                                                src="/experience-edit-icon.svg"
                                                alt="Edit"
                                                width={20}
                                                height={20}
                                                className="w-4 h-4"
                                            />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const updated = formData.workExperiences.filter((_, i) => i !== index);
                                                setFormData((prev) => ({ ...prev, workExperiences: updated }));
                                            }}
                                            title="Delete"
                                        >
                                            <Image
                                                src="/delete-icon.svg"
                                                alt="Delete"
                                                width={20}
                                                height={20}
                                                className="w-4 h-4"
                                            />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600">
                                    {exp.startMonth} {exp.startYear} –{' '}
                                    {exp.isCurrentJob ? 'Present' : `${exp.endMonth} ${exp.endYear}`}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="w-full px-4">
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentExperience({
                                    id: Date.now().toString(),
                                    employerName: '',
                                    jobTitle: '',
                                    startMonth: '',
                                    startYear: '',
                                    endMonth: '',
                                    endYear: '',
                                    jobDescription: '',
                                    isCurrentJob: false,
                                });
                                setShowSidebar(true);
                            }}
                            className="w-full flex justify-center items-center gap-4 font-[ClashGrotesk-Medium] h-14 rounded-xl p-4 border border-black"
                        >
                            <span className="text-base">Add Experience</span>
                        </button>
                    </div>
                </div>

                {/* Uploaded Works: show all projects stacked with their own title & images */}
                <div className="mt-10 mb-16 w-full max-w-[488px] mx-auto ">
                    <h2 className="text-lg font-bold uppercase mb-4 text-left">
                        Your Uploaded Works
                    </h2>

                    {formData.uploadedWorks.length === 0 && (
                        <p className="text-center text-gray-500">No works uploaded yet.</p>
                    )}

                    {formData.uploadedWorks.map((work) => (
                        <div
                            key={work.id}
                            className="border border-[#F2F2F2] p-4 rounded-lg mb-6"
                        >
                            <p className="text-lg font-bold mb-6 text-left border-b border-b-[#F2F2F2]">
                                {work.title || "Untitled Work"}
                            </p>

                            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-2">
                                {work.previewUrls.map((url, index) => (
                                    <div key={index} className="overflow-hidden rounded-xl w-full h-48 aspect-auto sm:aspect-square relative">
                                        <Image
                                            src={url}
                                            alt={`${work.title} - image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setShowProjectSidebar(true)}
                        type="button"
                        className="w-full h-14 border border-gray-300 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
                    >
                        Upload more work
                    </button>
                </div>

                {/* Save & Complete */}
                <Button
                    label={isLoading ? 'Loading...' : 'Save & Complete'}
                    className="w-full bg-black text-white py-3 rounded-xl"
                    disabled={isLoading}
                    onClick={completeProfileSubmission}
                />
            </div>

            <MakerSidebar
                visible={showSidebar}
                onClose={() => setShowSidebar(false)}
                currentExperience={currentExperience}
                setCurrentExperience={setCurrentExperience}
                onSave={handleSaveExperience}
                isLoading={false}
            />

            <ProjectUploadSidebar
                visible={showProjectSidebar}
                onClose={() => setShowProjectSidebar(false)}
                onSave={handleUploadNewWork}
            />
        </div>
    );
}
