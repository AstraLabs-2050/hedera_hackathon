'use client';

const EarningStatCardsSkeleton = () => (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-y-8 xl:gap-y-0 xs:grid-cols-1">
        {Array.from({ length: 4 }).map((_, i) => (
            <div
                key={i}
                className="flex flex-col gap-2 bg-[#F8F8F8] rounded-lg p-4 sm:p-3 xs:p-3 max-w-[350px] w-full animate-pulse"
            >
                <div className="w-10 h-10 bg-gray-300 rounded-full sm:w-8 sm:h-8 xl:w-10 xl:h-10"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 sm:w-2/3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 sm:w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 sm:w-4/5 mt-1"></div>
            </div>
        ))}
    </div>
);

export default EarningStatCardsSkeleton;
