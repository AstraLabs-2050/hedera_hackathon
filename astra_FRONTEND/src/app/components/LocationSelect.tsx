// components/onboarding/LocationSelect.tsx
import countries from 'world-countries';

type Props = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function LocationSelect({ value, onChange }: Props) {
    const allCountries = countries.map((country) => country.name.common);

    return (
        <div>
            <label className="block text-lg sm:text-xl font-medium text-left mb-4 sm:mb-6">
                What is your current location?
            </label>
            <select
            required
                value={value}
                onChange={onChange}
                className="w-full px-3 py-3 bg-white border border-[#BDBDBD] rounded-md focus:outline-none focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
                <option value="">Enter your location</option>
                {allCountries.map((country) => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                ))}
            </select>
        </div>
    );
}
