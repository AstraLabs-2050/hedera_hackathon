'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';

type ChatPaySidebarNavigationProps = {
    label: string;
    image: string;
    // activeImage: string;
    path: string;
    showLabel?: boolean;
};

const ChatPaySidebarNavigation: React.FC<ChatPaySidebarNavigationProps> = ({
    label,
    image,
    // activeImage,
    path,
    showLabel = true,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    const isActive =  pathname === path;

    const handleClick = () => {
        if (path) router.push(path);
    };

    return (
        <div
            className={`
        flex items-center rounded-[10px] gap-4 px-4 py-3 cursor-pointer transition-colors duration-200
        ${isActive || isHovered ? 'bg-[#f0f0f0] text-black' : 'text-[#4f4f4f]'}
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <Image
                src={image}
                alt={label.toLowerCase()}
                width={24}
                height={24}
            />
            {showLabel && (
                <span className="font-[ClashGrotesk-Medium] text-base leading-6 whitespace-nowrap">{label}</span>
            )}
        </div>
    );
};

export default ChatPaySidebarNavigation;
