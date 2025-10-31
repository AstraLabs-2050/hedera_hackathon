'use client';
import Image from 'next/image';

export type WorkExperience = {
    id: string;
    employerName: string;
    jobTitle: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    jobDescription: string;
    isCurrentJob: boolean;
};

type ExperienceListProps = {
    experiences: WorkExperience[];
    onEdit: (exp: WorkExperience) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
};

const formatDateRange = (
    startMonth: string,
    startYear: string,
    endMonth: string,
    endYear: string,
    isCurrentJob: boolean
) => {
    const start = startMonth && startYear ? `${startMonth} ${startYear}` : '';
    const end = isCurrentJob ? 'Present' : (endMonth && endYear ? `${endMonth} ${endYear}` : '');
    return start && end ? `${start} - ${end}` : start || end;
};

export default function ExperienceList({
    experiences,
    onEdit,
    onDelete,
    onAdd,
}: ExperienceListProps) {
    return (
        <div className="max-w-md mx-auto mb-4">
            <div className="text-left mb-4">
                <h3 className="text-base font-bold mb-8 sm:mb-6 lg:mb-4">YOUR WORK EXPERIENCE</h3>
            </div>

            {experiences.map((experience) => (
                <div
                    key={experience.id}
                    className="bg-[#F6F6F6] border border-[#E0E0E0] rounded-lg p-4 mb-4 flex items-center justify-between"
                >
                    <div className="flex-1 text-left">
                        <div className="font-bold">
                            {experience.jobTitle} - {experience.employerName}
                        </div>
                        <div className="text-sm text-[#4F4F4F] mt-1">
                            {formatDateRange(
                                experience.startMonth,
                                experience.startYear,
                                experience.endMonth,
                                experience.endYear,
                                experience.isCurrentJob
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onEdit(experience)}
                            className="p-2 rounded"
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
                            onClick={() => onDelete(experience.id)}
                            className="p-2 rounded"
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
            ))}

            <button
                onClick={onAdd}
                className="w-full border border-black rounded-lg py-3 transition-colors font-bold"
            >
                Add Experience
            </button>
        </div>
    );
}
