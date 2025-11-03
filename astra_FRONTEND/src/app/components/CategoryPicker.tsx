import { useState } from "react";
import CategorySelect from "./CategorySelect";

type CategoryPickerProps = {
    category: string;
    setCategory: (category: string) => void;
    options: string[];
};

export default function CategoryPicker({ category, setCategory, options }: CategoryPickerProps) {
    const [showSelector, setShowSelector] = useState(false);

    const handleSelect = (newCategory: string) => {
        setCategory(newCategory);
        setShowSelector(false); // hide after picking
    };

    return (
        <div className="px-2 sm:px-0">
            <div className="relative w-full">
                <input
                    type="text"
                    value={category}
                    readOnly
                    className="w-full border border-[#BDBDBD] rounded-md px-3 py-2 pr-16" // pr-16 for space for button
                />
                <button
                    type="button"
                    onClick={() => setShowSelector((prev) => !prev)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-sm font-medium"
                >
                    Change
                </button>
            </div>

            {showSelector && (
                <div className="mt-4">
                    <CategorySelect
                        selected={category ? [category] : []}
                        toggleCategory={handleSelect}
                        options={options}
                    />
                </div>
            )}
        </div>
    );
}
