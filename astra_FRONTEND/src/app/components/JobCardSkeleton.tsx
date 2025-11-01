// components/JobCardSkeleton.tsx
'use client';

import React from 'react';

export default function JobCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-[#BDBDBD] w-full p-4 flex flex-col xl:flex-row md:items-center gap-4 animate-pulse">
            {/* Image placeholder */}
            <div className="w-full h-72 lg:h-64 xl:h-72 bg-gray-300 rounded-2xl"></div>

            {/* Content placeholders */}
            <div className="flex flex-col justify-center gap-3 w-full">
                <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                <div className="w-32 h-4 bg-gray-300 rounded"></div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-16 h-3 bg-gray-300 rounded"></div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-16 h-3 bg-gray-300 rounded"></div>
                </div>

                <div className="w-40 h-3 bg-gray-300 rounded"></div>
                <div className="w-24 h-3 bg-gray-300 rounded"></div>

                <div className="flex gap-4">
                    <div className="w-24 h-8 bg-gray-300 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
