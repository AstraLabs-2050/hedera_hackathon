"use client";

const RecentActivitiesTableSkeleton = () => {
    // widths per column: Timestamp, Description, Brand Name, Status, Amount, Payment Status
    const colWidths = ["w-16 sm:w-20", "w-48 sm:w-64", "w-24 sm:w-32", "w-20 sm:w-24", "w-16 sm:w-20", "w-32 sm:w-40"];

    return (
        <div className="font-[ClashGrotesk-regular] mt-10">
            <h2 className="text-2xl font-[ClashGrotesk-bold] mb-4">Recent Activities</h2>
            <div className="overflow-x-auto">
                <div className="min-w-[800px] lg:min-w-[900px] p-6 lg:p-12 border border-[#F6F6F6] rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[#4F4F4F] text-xs lg:text-sm border-b border-b-[#F6F6F6]">
                                {["Timestamp", "Description", "Brand Name", "Status", "Amount", "Payment Status"].map((head, idx) => (
                                    <th key={idx} className="py-3 whitespace-nowrap">{head}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx} className="bg-white rounded-lg border-b border-b-[#F6F6F6] last:border-b-0 text-sm lg:text-base animate-pulse">
                                    {colWidths.map((w, cellIdx) => (
                                        <td key={cellIdx} className="py-4 whitespace-nowrap">
                                            <div className={`h-4 bg-gray-300 rounded ${w}`}></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecentActivitiesTableSkeleton;
