'use client';

import ProgressHeader from '../ProgressHeader';
import Button from '../button';
import TagInput from '../TagInput';
import ProfileImageUpload from '../ProfileImageUpload';
import LocationSelect from '../LocationSelect';
import CategorySelect from '../CategorySelect';

type Step3Props = {
    formData: {
        profilePicture: File | null;
        location: string;
        categories: string[];
        skills: string[];
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onNext: () => void;
    onBack: () => void;
};

export default function Step3({ formData, setFormData, onNext, onBack }: Step3Props) {
    const isLoading = false;

    const categoryOptions = [
        'Freelance Tailor',
        'Small Scale Manufacturer',
        'Large Scale Manufacturer',
    ];

    const canProceed =
        // !!formData.profilePicture &&
        formData.location.trim() !== '' &&
        formData.categories.length > 0;


    const toggleCategory = (category: string) => {
    setFormData(prev => {
        const alreadySelected = prev.categories.includes(category);

        if (alreadySelected) {
            // Unselect it
            return { ...prev, categories: [] };
        } else {
            // Always replace with the new one
            return { ...prev, categories: [category] };
        }
    });
};


    return (
        <div className="w-full max-w-6xl text-center bg-white rounded-3xl px-4 sm:px-6 md:px-8 pt-4 pb-20">
            <ProgressHeader step={3} onBack={onBack} />

            <div className="max-w-2xl mx-auto px-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black my-8">
                        Tell us a little about yourself
                    </h1>

                    {/* Profile Image Upload */}
                    <ProfileImageUpload
                        profilePicture={formData.profilePicture}
                        onChange={(file) => setFormData(prev => ({ ...prev, profilePicture: file }))}
                    />

                    <div className="space-y-6">
                        {/* Location */}
                        <LocationSelect
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />

                        {/* Categories */}
                        <CategorySelect
                            selected={formData.categories}
                            toggleCategory={toggleCategory}
                            options={categoryOptions}
                        />

                        {/* Skills */}
                        <TagInput
                        label="What are your skills?"
                            skills={formData.skills}
                            setSkills={(updatedSkills) =>
                                setFormData(prev => ({ ...prev, skills: updatedSkills }))
                            }
                        />

                        {/* Next Button */}
                        <div className="pt-6 flex justify-center">
                            <Button
                                label={isLoading ? "Loading..." : "Next - Enter Work Experience"}
                                fullWidth={false}
                                disabled={isLoading || !canProceed}
                                className="rounded-xl mt-4 max-w-md w-full"
                                onClick={onNext}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
