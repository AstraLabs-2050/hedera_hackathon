import React, { useState } from 'react';

type TagInputProps = {
    label?: string;
    skills: string[];
    step?: number;
    setSkills: (skills: string[]) => void;
};

export default function TagInput({ label, skills, setSkills, step }: TagInputProps) {
    const [skillInput, setSkillInput] = useState('');

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = skillInput.trim();
            if (trimmed && !skills.includes(trimmed)) {
                setSkills([...skills, trimmed]);
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((skill) => skill !== skillToRemove));
    };

    return (
        <div className="px-2 sm:px-0">
            {label && (
                <label className={`block text-lg sm:text-xl mb-4 sm:mb-6 ${ step === 4 || step === 5 ? 'text-center' : 'text-left'  } `}>
                    {label}
                </label>
            )}

            <div className="flex flex-wrap gap-1 sm:gap-2 border border-[#BDBDBD] px-2 sm:px-3 py-2 rounded-md min-h-[2.5rem] sm:min-h-[3rem]">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm md:text-base bg-[#F2F2F2] border-none whitespace-nowrap"
                    >
                        <span className="truncate max-w-[150px] sm:max-w-none">{skill}</span>
                        <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-base focus:outline-none flex-shrink-0 hover:text-red-500 transition-colors"
                        >
                            &times;
                        </button>
                    </span>
                ))}

                <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder=""
                    className="flex-grow text-base px-1 sm:px-2 py-1 focus:outline-none min-w-[100px] sm:min-w-[120px]"
                />
            </div>
        </div>
    );
}