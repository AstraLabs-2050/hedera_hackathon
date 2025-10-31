'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';

type SidebarNavigationProps = {
    label: string;
    image: string;
    activeImage: string;
    path: string;
    showLabel?: boolean;
};

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
    label,
    image,
    activeImage,
    path,
    showLabel = true,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    const isActive = path && pathname.startsWith(path);

    const handleClick = () => {
        if (path) router.push(path);
    };

    return (
        <div
            className={`
        flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200
        ${isActive || isHovered ? 'bg-black text-white' : 'bg-white text-[#4F4F4F]'}
        hover:text-white
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <Image
                src={isActive || isHovered ? activeImage : image}
                alt={label.toLowerCase()}
                width={24}
                height={24}
            />
            {showLabel && (
                <span className="font-medium text-base leading-6 whitespace-nowrap">{label}</span>
            )}
        </div>
    );
};

export default SidebarNavigation;
