'use client';

import { useState } from 'react';
import ProgressHeader from '../ProgressHeader';
import Button from '../button';
import Image from 'next/image';
import countries from 'world-countries';

type Step4Props = {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onNext: () => void;
    onBack: () => void;
};

export default function Step4({ formData, setFormData, onNext, onBack }: Step4Props) {
    const allCountries = countries.map((country) => country.name.common);
    const [isLoading, setIsLoading] = useState(false);
    const [agreeInfo, setAgreeInfo] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handlePersonalIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []).filter((file) =>
            file.type.startsWith('image/')
        );

        if (files.length > 0) {
            setFormData((prev: any) => ({
                ...prev,
                personalIdFiles: files,
            }));
        }
    };

    const handleBusinessCertUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFormData((prev: any) => ({ ...prev, businessCertFile: file }));
        }
    };

    const removePersonalIdFile = (indexToRemove: number) => {
        setFormData((prev: any) => ({
            ...prev,
            personalIdFiles: prev.personalIdFiles.filter((_: any, i: number) => i !== indexToRemove),
        }));
    };

    const removeBusinessCertFile = () =>
        setFormData((prev: any) => ({ ...prev, businessCertFile: null }));

    const inputBase =
        'w-full h-12 px-4 border border-[#E4E4E7] rounded-lg bg-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="w-full max-w-6xl bg-white rounded-3xl px-4 sm:px-6 md:px-8 pt-4 pb-20 mx-auto">
            <ProgressHeader step={4} onBack={onBack} />

            <h2 className="text-2xl sm:text-3xl font-semibold mt-10 md:mt-6 text-center">
                Verify Your Identity or Business Registration Doc.
            </h2>

            {/* Section: Personal Information */}
            <div className="text-left mt-10 space-y-6">
                <h3 className="font-semibold text-lg md:text-xl sm:text-lg border-b border-b-[#E2E2E2] pb-2">
                    Personal Information
                </h3>

                <div className="w-full flex justify-center mb-6">
                    <div className="flex flex-col w-full max-w-lg items-center justify-center text-center mx-auto">
                        <p className="text-base md:text-xl font-bold py-6">Upload a government-issued ID</p>
                        <div className="w-full border border-dashed border-[#1D40C8] bg-[#F9FAFB] p-6 rounded-lg text-center hover:bg-gray-50 transition">
                            <div className="flex flex-col items-center gap-2 relative">
                                <label htmlFor="personal-id-upload" className="cursor-pointer">
                                    <Image src="/backup.svg" alt="upload-logo" width={32} height={32} />
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePersonalIdUpload}
                                    className="hidden"
                                    id="personal-id-upload"
                                />

                                <p className="text-sm font-medium">
                                    Drag your file(s) or{' '}
                                    <label htmlFor="personal-id-upload" className="text-[#1D40C8] underline cursor-pointer">
                                        browse
                                    </label>

                                </p>
                                    <p className="text-sm text-[#4F4F4F] mt-1">
                                        Please upload both the front and back of your ID.
                                    </p>
                                <p className="text-sm text-[#4F4F4F] mt-1">Max 10 MB files are allowed (Accepted file formats: .jpg, .png, .jpeg, .webp only)</p>

                                {formData.personalIdFiles?.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {formData.personalIdFiles.map((file: File, index: number) => (
                                            <div key={index} className="relative max-w-xs w-full">
                                                <button
                                                    onClick={() => removePersonalIdFile(index)}
                                                    className="absolute -top-2 -right-2 bg-white border border-gray-300 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-100 z-10"
                                                    aria-label="Remove file"
                                                >
                                                    &times;
                                                </button>

                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="max-h-48 w-full object-contain rounded-md border border-gray-200"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name on ID</label>
                        <input
                            className={inputBase}
                            placeholder="Enter your name"
                            value={formData.personalIdName || ''}
                            onChange={(e) => setFormData({ ...formData, personalIdName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Country of issue</label>
                        <select
                            className={inputBase}
                            value={formData.personalIdCountry || ''}
                            onChange={(e) => setFormData({ ...formData, personalIdCountry: e.target.value })}
                        >
                            <option value="">Select an option</option>
                            {allCountries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date on ID</label>
                        <input
                            type="date"
                            value={formData.personalIdExpiry || ''}
                            onChange={(e) => setFormData({ ...formData, personalIdExpiry: e.target.value })}
                            className={inputBase}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Do you represent a business?</label>
                        <select
                            className={inputBase}
                            value={formData.isBusiness || ''}
                            onChange={(e) => setFormData({ ...formData, isBusiness: e.target.value })}
                        >
                            <option value="">Select an option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section: Proof of Business */}
            {/* {formData.isBusiness === 'yes' && ( */}
                <div className="text-left mt-10 space-y-6">
                    <h3 className="font-semibold text-lg md:text-xl sm:text-lg border-b border-b-[#E2E2E2] pb-2">
                        Proof of Business
                    </h3>

                    <div className="w-full flex justify-center mb-6">
                        <div className="flex flex-col w-full max-w-lg items-center justify-center text-center mx-auto">
                            <p className="text-base md:text-xl font-bold py-6">
                                Upload your Business Registration Certificate
                            </p>
                            <div className="w-full border border-dashed border-[#1D40C8] bg-[#F9FAFB] p-6 rounded-lg text-center hover:bg-gray-50 transition">
                                <div className="flex flex-col items-center gap-2 relative">
                                    <label htmlFor="business-cert-upload" className="cursor-pointer">
                                        <Image src="/backup.svg" alt="upload-logo" width={32} height={32} />
                                    </label>

                                    <input
                                        type="file"
                                        accept="*"
                                        onChange={handleBusinessCertUpload}
                                        className="hidden"
                                        id="business-cert-upload"
                                    />

                                    <p className="text-sm font-medium">
                                        Drag your file(s) or{' '}
                                        <label htmlFor="business-cert-upload" className="text-[#1D40C8] underline cursor-pointer">
                                            browse
                                        </label>
                                    </p>
                                    <p className="text-sm text-[#4F4F4F] mt-1">Max 10 MB files are allowed</p>

                                    {formData.businessCertFile && (
                                        <div className="relative mt-4 max-w-xs w-full">
                                            <button
                                                onClick={removeBusinessCertFile}
                                                className="absolute -top-2 -right-2 bg-white border border-gray-300 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-100 z-10"
                                                aria-label="Remove file"
                                            >
                                                &times;
                                            </button>

                                            {formData.businessCertFile.type?.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(formData.businessCertFile)}
                                                    alt="Preview"
                                                    className="max-h-48 w-full object-contain rounded-md border border-gray-200"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-left">
                                                    <span className="text-sm font-medium text-gray-800 truncate">
                                                        📄 {formData.businessCertFile.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
                        <div>
                            <label className="block text-sm font-medium mb-2">Business Name</label>
                            <input
                                className={inputBase}
                                placeholder="Enter your business name"
                                value={formData.businessName || ''}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tax/Registration number</label>
                            <input
                                type="text"
                                placeholder="Enter your Tax/Registration number"
                                className={inputBase}
                                value={formData.taxRegistrationNumber || ''}
                                onChange={(e) => setFormData({ ...formData, taxRegistrationNumber: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Country of Registration</label>
                            <select
                                className={inputBase}
                                value={formData.registrationCountry || ''}
                                onChange={(e) => setFormData({ ...formData, registrationCountry: e.target.value })}
                            >
                                <option value="">Select an option</option>
                                {allCountries.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Type of Business</label>
                            <select
                                className={inputBase}
                                value={formData.businessType || ''}
                                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                            >
                                <option value="">Select an option</option>
                                <option value="LLC">LLC</option>
                                <option value="Sole Proprietor">Sole Proprietor</option>
                                <option value="Corporation">Corporation</option>
                            </select>
                        </div>
                    </div>
                </div>

            {/* Terms & Checkboxes */}
            <div className="w-full flex justify-center">
                <div className="flex flex-col w-full max-w-3xl px-4 md:px-0">
                    <div className="mt-10 space-y-4 text-lg text-left">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={agreeInfo}
                                onChange={(e) => setAgreeInfo(e.target.checked)}
                                className="mt-1 w-3 h-3 md:w-5 md:h-5 accent-black border-2 border-gray-400 rounded-sm"
                            />
                            <span className="text-sm md:text-lg">
                                I confirm all information is true and I am authorised to submit these documents.
                            </span>
                        </label>
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-1 w-3 h-3 md:w-5 md:h-5 accent-black border-2 border-gray-400 rounded-sm"
                            />                             <span className="text-sm md:text-lg">
                                I agree to ASTRA&rsquo;s Maker Terms of Service.
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 flex justify-center">
                <Button
                    label={isLoading ? 'Loading...' : 'Submit for Review'}
                    fullWidth={false}
                    disabled={isLoading || !agreeInfo || !agreeTerms}
                    className="rounded-xl max-w-md w-full"
                    onClick={() => {
                        console.log('Step4 Data Preview', formData);
                        onNext();
                    }}
                />
            </div>
        </div>
    );
}
