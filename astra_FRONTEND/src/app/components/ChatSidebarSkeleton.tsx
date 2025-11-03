import React from 'react'

const ChatSidebarSkeleton: React.FC = () => {
    return (
        <div className="h-full bg-white border-r border-gray-200 font-[ClashGrotesk-regular]">
            {/* Header Section */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>

                {/* Search bar skeleton */}
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Chat List Section */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {/* Individual chat item skeletons */}
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 animate-pulse"
                    >
                        {/* Avatar skeleton */}
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>

                        {/* Content skeleton */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-3 bg-gray-200 rounded w-12"></div>
                            </div>

                            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>

                        {/* Status indicator skeleton */}
                        <div className="h-2 w-2 bg-gray-200 rounded-full flex-shrink-0"></div>
                    </div>
                ))}
            </div>

            {/* Bottom section skeleton (if needed) */}
            <div className="p-4 sm:p-6 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatSidebarSkeleton