'use client';

import { useState } from 'react';
import ProgressHeader from '../ProgressHeader';
import Button from '../button';
import Image from 'next/image';
import type { FormData, UploadedWork } from '@/types/types';
import ProjectUploadSidebar from '../ProjectUploadSidebar';

type Step6Props = {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: () => void;
    onBack: () => void;
};

export default function Step6({ formData, setFormData, onNext, onBack }: Step6Props) {
    const [showProjectSidebar, setShowProjectSidebar] = useState(false);

    const handleUploadNewWork = (newWork: UploadedWork) => {
        // Add the new project as a separate item in the uploadedWorks array
        setFormData(prev => ({
            ...prev,
            uploadedWorks: [...prev.uploadedWorks, newWork],
        }));
        setShowProjectSidebar(false);
    };

    // Calculate total uploaded images across all projects (optional, if you want to limit total images)
    const totalUploadedImages = formData.uploadedWorks.reduce(
        (total, work) => total + work.images.length,
        0
    );

    return (
        <div className="w-full max-w-6xl text-center bg-white rounded-3xl pt-4 pb-8 min-h-[70dvh] mx-auto px-4 sm:px-2 relative">
            <ProgressHeader step={6} onBack={onBack} />

            <div className="lg:mt-8 mt-10 sm:mt-10">
                <h2 className="text-3xl font-semibold">Upload some of your best works</h2>

                {formData.uploadedWorks.length === 0 ? (
                    <div className="lg:mt-6 mt-12 max-w-lg mx-auto">
                        <div
                            className={`sm:w-full lg:w-full h-72 lg:mb-6 mb-10 rounded-2xl flex items-center justify-center cursor-pointer transition-colors bg-[#F0F0F0] hover:bg-gray-200`}
                            onClick={() => setShowProjectSidebar(true)}
                        >
                            <div className="lg:w-12 lg:h-12 w-16 h-16 rounded-full flex bg-[#E0E0E0] items-center justify-center">
                                <span className="flex items-center justify-center text-[#F0F0F0] text-5xl font-bold">+</span>
                            </div>
                        </div>

                        <Button
                            label="Next"
                            fullWidth={false}
                            className="rounded-xl w-full mx-auto"
                            onClick={onNext}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center mt-16 space-y-12">
                        {formData.uploadedWorks.map((work) => (
                            <div
                                key={work.id}
                                className="text-left p-6 border border-[#F2F2F2] rounded-lg max-w-lg w-full"
                            >
                                <h3 className="text-lg font-bold border-b border-b-[#F2F2F2] pb-2 mb-4">
                                    {work.title}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                                    {work.previewUrls.slice(0, 4).map((url, index) => (
                                        <div key={index} className="overflow-hidden rounded-lg">
                                            <Image
                                                width={300}
                                                height={300}
                                                src={url}
                                                alt={`${work.title} - ${index + 1}`}
                                                className="w-full h-48 md:w-56 md:h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Button to upload a new project */}
                        <button
                            onClick={() => setShowProjectSidebar(true)}
                            className="max-w-lg w-full sm:w-full border-2 border-black rounded-xl px-8 py-3 font-bold transition-colors"
                        >
                            Upload more work
                        </button>

                        <div className="mt-12 max-w-lg w-full sm:w-full mx-auto">
                            <Button
                                label="Next"
                                fullWidth={false}
                                className="rounded-xl w-full"
                                onClick={onNext}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Project Upload Sidebar */}
            <ProjectUploadSidebar
                visible={showProjectSidebar}
                onClose={() => setShowProjectSidebar(false)}
                onSave={handleUploadNewWork}
            />
        </div>
    );
}