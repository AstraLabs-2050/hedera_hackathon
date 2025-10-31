// components/onboarding/CategorySelect.tsx

type Props = {
    selected: string[];
    toggleCategory: (cat: string) => void;
    options: string[];
    step?: number;
};

export default function CategorySelect({ selected, toggleCategory, options, step }: Props) {
    return (
        <div>
            {step === 7 && (
                <label className="block text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-left px-2 sm:px-0">
                    What category best suits you?
                </label>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full px-2 sm:px-0">
                {options.map((category) => (
                    <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`flex items-center justify-between sm:justify-around gap-1 sm:gap-2 rounded-md border text-xs sm:text-sm font-medium transition-colors h-12 sm:h-14 w-full text-center px-2 sm:px-3 ${selected.includes(category)
                            ? 'text-[#1D40C8] border-[#1D40C8]'
                            : 'bg-white border-[#BDBDBD]'
                            }`}
                    >
                        <span className="flex-1 text-left sm:text-center truncate">{category}</span>
                        {selected.includes(category) && (
                            <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#1D40C8] rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}