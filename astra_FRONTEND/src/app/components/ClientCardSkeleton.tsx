'use client';

import React from 'react';

export default function ClientCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 border rounded-xl p-6 max-w-full h-fit xl:max-w-xs mt-10 lg:mt-14 animate-pulse">
            {/* Title */}
            <div className="h-4 w-1/3 bg-gray-300 rounded"></div>

            {/* Avatar */}
            <div className="h-16 w-16 bg-gray-300 rounded-full"></div>

            {/* Name */}
            <div className="h-5 w-1/2 bg-gray-300 rounded"></div>

            {/* Bio */}
            <div className="h-4 w-full bg-gray-300 rounded mt-2"></div>
            <div className="h-4 w-5/6 bg-gray-300 rounded mt-1"></div>

            {/* Dates */}
            <div className="flex flex-col gap-2 mt-4">
                <div className="h-3 w-1/3 bg-gray-300 rounded"></div>
                <div className="h-3 w-1/4 bg-gray-300 rounded"></div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="h-10 w-full md:w-full bg-gray-300 rounded-full"></div>
                <div className="h-10 w-full md:w-full bg-gray-300 rounded-full"></div>
            </div>
        </div>
    );
}
