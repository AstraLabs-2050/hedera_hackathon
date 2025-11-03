import React from "react";

// Define JobFilter type
export type JobFilter = "applications" | "ongoing" | "completed" | "all";

interface JobsTabsProps {
    activeTab: JobFilter;
    onTabChange: (tab: JobFilter) => void;
}

// Define the tabs with corresponding IDs
const tabs: { id: JobFilter; label: string }[] = [
    { id: "applications", label: "Applications" },
    { id: "ongoing", label: "Ongoing" },
    { id: "completed", label: "Completed" },
    { id: "all", label: "All" },
];

const JobsTabs: React.FC<JobsTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div
            className="
        flex items-center border-b border-[#F2F2F2] py-4
        overflow-x-auto md:overflow-x-visible
        scrollbar-hide
      "
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
            font-medium transition-colors duration-200 text-[#4F4F4F]
            ${activeTab === tab.id
                            ? "border-b-2 bg-[#E0E0E0] rounded-full"
                            : "text-[#4F4F4F]"
                        }
            w-36 p-3 text-sm
            sm:w-28 sm:text-base
            xs:w-auto xs:px-4 xs:py-2
          `}
                >
                    <strong>{tab.label}</strong>
                </button>
            ))}
        </div>
    );
};

export default JobsTabs;
