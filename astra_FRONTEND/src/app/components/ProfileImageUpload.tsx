'use client';
import Image from 'next/image';
import { useRef } from 'react';

type Props = {
    profilePicture: File | null;
    onChange: (file: File) => void;
};

export default function ProfileImageUpload({ profilePicture, onChange }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onChange(file);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="mb-8 flex flex-col items-center">
            {/* Circular Upload Area */}
            <div
                className="relative w-32 h-32 bg-[#F8F8F8] rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={triggerFileSelect}
            >
                {/* Hidden File Input (shared by both click and label) */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />

                {/* Uploaded Image or Placeholder */}
                {profilePicture ? (
                    <Image
                        src={URL.createObjectURL(profilePicture)}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <>
                        <div className="w-32 h-32 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                            <svg
                                className="w-24 h-24 text-[#EBEBEB]"
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

                        {/* Pencil Icon in Center */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-920">
                            <div className=" bg-none w-10 h-10 flex items-center justify-center border-none">
                                <Image
                                    src="/edit-icon.svg"
                                    alt="Edit"
                                    width={16}
                                    height={16}
                                    className="w-6 h-6"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Upload Text that also triggers file select */}
            <p
                onClick={triggerFileSelect}
                className="cursor-pointer underline text-sm mt-2"
            >
                Upload profile image
            </p>
        </div>
    );
}