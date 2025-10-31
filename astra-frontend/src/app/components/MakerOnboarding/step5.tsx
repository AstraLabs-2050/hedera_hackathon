'use client';

import { useRef, useState } from 'react';
import ProgressHeader from '../ProgressHeader';
import Button from '../button';
import ExperienceList from '../ExperienceList';
import MakerSidebar from '../MakerSidebar';
import { WorkExperience } from '@/types/types';
// import * as pdfjsLib from 'pdfjs-dist';
// import mammoth from 'mammoth';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Set the workerSrc manually from CDN (works in most Next.js apps)
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type Step5Props = {
    formData: {
        workExperiences: WorkExperience[];
        fullName: string;
        email: string;
        profilePicture: File | null;
        location: string;
        categories: string[];
        skills: string[];
    };
    setFormData: React.Dispatch<React.SetStateAction<Step5Props['formData']>>;
    onNext: () => void;
    onBack: () => void;
};

export default function Step5({ formData, setFormData, onNext, onBack }: Step5Props) {
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
        isCurrentJob: false,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddExperience = () => {
        setCurrentExperience({
            id: '',
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
    };

    const handleSaveExperience = (updatedExperience: WorkExperience) => {
        const newExperience = {
            ...updatedExperience,
            id: updatedExperience.id || Date.now().toString(),
        };

        const updatedExperiences = updatedExperience.id
            ? formData.workExperiences.map((exp) =>
                exp.id === updatedExperience.id ? newExperience : exp
            )
            : [...formData.workExperiences, newExperience];

        setFormData((prev) => ({
            ...prev,
            workExperiences: updatedExperiences,
        }));

        setShowSidebar(false);
        setCurrentExperience({
            id: '',
            employerName: '',
            jobTitle: '',
            startMonth: '',
            startYear: '',
            endMonth: '',
            endYear: '',
            jobDescription: '',
            isCurrentJob: false,
        });
    };

    const handleEditExperience = (experience: WorkExperience) => {
        setCurrentExperience(experience);
        setShowSidebar(true);
    };

    const handleDeleteExperience = (id: string) => {
        const updatedExperiences = formData.workExperiences.filter((exp) => exp.id !== id);
        setFormData((prev) => ({
            ...prev,
            workExperiences: updatedExperiences,
        }));
    };

    const handleAutoFillResume = () => {
        fileInputRef.current?.click();
    };

//     const handlePdfUpload = async (file: File) => {
//     if (!file) return;
//     setIsLoading(true);

//     const reader = new FileReader();

//     reader.onload = async function () {
//         const typedarray = new Uint8Array(this.result as ArrayBuffer);

//         try {
//             const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
//             let textContent = '';

//             for (let i = 1; i <= pdf.numPages; i++) {
//                 const page = await pdf.getPage(i);
//                 const text = await page.getTextContent();
//                 const pageText = text.items.map((item: any) => item.str).join(' ');
//                 textContent += pageText + '\n';
//             }

//             extractExperiences(textContent);
//         } catch (error) {
//             console.error('Error reading PDF:', error);
//             setIsLoading(false);
//         }
//     };

//     reader.readAsArrayBuffer(file);
// };

const handlePdfUpload = async (file: File) => {
    if (!file) return;
    setIsLoading(true);
    
    // 🔒 Resume auto-fill functionality is temporarily disabled
    console.log('Auto-fill is currently paused.');
    
    setTimeout(() => {
        setIsLoading(false);
    }, 1000);
};


const extractExperiences = (text: string) => {
    // Simple regex pattern to match blocks like: Job Title at Company (Jan 2020 - Jun 2022)
    const experienceRegex = /([\w\s]+)\s+at\s+([\w\s]+)\s+\((\w+)\s+(\d{4})\s*-\s*(\w+)?\s*(\d{4})?\)/gi;
    const experiences: WorkExperience[] = [];

    let match;
    while ((match = experienceRegex.exec(text)) !== null) {
        const [_, jobTitle, employerName, startMonth, startYear, endMonth, endYear] = match;

        const experience: WorkExperience = {
            id: Date.now().toString() + Math.random(),
            jobTitle: jobTitle.trim(),
            employerName: employerName.trim(),
            startMonth,
            startYear,
            endMonth: endMonth || '',
            endYear: endYear || '',
            jobDescription: '', // You can later add more regex to get nearby text as description
            isCurrentJob: !endMonth && !endYear,
        };

        experiences.push(experience);
    }

    if (experiences.length > 0) {
        setFormData((prev) => ({
            ...prev,
            workExperiences: [...prev.workExperiences, ...experiences],
        }));
    } else {
        alert("No work experience could be auto-filled. Try a clearer format.");
    }

    setIsLoading(false);
};



    return (
        <div className="w-full max-w-6xl text-center bg-white rounded-3xl px-6 md:px-8 pt-4 min-h-[70dvh] mx-auto">
            <ProgressHeader step={5} onBack={onBack} />

            <div className="pt-10 sm:pt-12 lg:pt-5">
                <h2 className="text-3xl font-bold mb-14 sm:mb-12 lg:mb-8">Work Experience or School Certification</h2>

                <div className="flex justify-center items-center mb-10 sm:mb-12 lg:mb-8 border border-[#E0E0E0] rounded-md p-8 max-w-lg max-h-64 lg:max-w-md lg:max-h-40 mx-auto">
                    <button
                        onClick={handleAutoFillResume}
                        className="w-full flex flex-col items-center justify-center bg-[#F2F2F2] rounded-lg p-8 transition-colors max-w-lg max-h-36 lg:max-w-md lg:max-h-28"
                    >
                        <div className="text-sm mt-1 pb-4 text-[#4F4F4F] font-bold">Auto-Fill with Resume</div>
                        <span className="w-7 h-7 text-lg flex items-center justify-center bg-[#BDBDBD] rounded-full">+</span>
                    </button>
                    <input
                        type="file"
                        accept=".pdf,.docx"
                        ref={fileInputRef}
                        onChange={(e) => handlePdfUpload(e.target.files?.[0])}
                        className="hidden"
                    />
                </div>

                <ExperienceList
                    experiences={formData.workExperiences}
                    onEdit={handleEditExperience}
                    onDelete={handleDeleteExperience}
                    onAdd={handleAddExperience}
                />

                <div className="flex justify-center">
                    <Button
                        label={isLoading ? 'Loading...' : 'Next'}
                        fullWidth={false}
                        disabled={isLoading}
                        className="rounded-xl my-2 lg:my-4 max-w-md w-full"
                        onClick={onNext}
                    />
                </div>
            </div>

            <MakerSidebar
                visible={showSidebar}
                onClose={() => setShowSidebar(false)}
                currentExperience={currentExperience}
                setCurrentExperience={setCurrentExperience}
                onSave={handleSaveExperience}
                isLoading={isLoading}
            />
        </div>
    );
}
