// components/ProjectCardSkeleton.tsx
'use client';

import React from 'react';

export default function ProjectCardSkeleton() {
    return (
        <div className="max-w-lg border rounded-xl p-4 animate-pulse">
            {/* Title */}
            <div className="h-5 w-1/3 bg-gray-200 rounded mb-4"></div>

            {/* Grid images */}
            <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-[4/3] rounded-md bg-gray-200"
                    />
                ))}
            </div>
        </div>
    );
}
