'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import CreatorSidebarNavigation from './CreatorSidebarNavigation';

const navItems = [
    { label: 'Dashboard', icon: '/dashboard-iconn.svg', activeIcon: '/dashboard-white-icon.svg', path: '/creator/dashboard' },
    { label: 'Ongoing Jobs', icon: '/ongoing-jobs-icon.svg', activeIcon: '/ongoing-jobs-white-icon.svg', path: '/creator/ongoingJobs' },
    { label: 'Earnings', icon: '/earnings-icon.svg', activeIcon: '/earnings-white-icon.svg', path: '/creator/earnings' },
    { label: 'Messages', icon: '/messages-icon.svg', activeIcon: '/message-white-icon.svg', path: '/creator/messages' },
    { label: 'Account Settings', icon: '/settings.svg', activeIcon: '/settings-white-icon.svg', path: '/creator/accountSettings' },
];

const supportItem = {
    label: 'Help & Support',
    icon: '/help-support-icon.svg',
    activeIcon: '/help-support-white-icon.svg',
    path: '',
};

export default function CreatorSidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < 1024);
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    return (
        <>
            {/* Overlay for mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* MOBILE Floating Toggle Button */}
            {isMobile && !isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed top-4 left-4 z-[100]"
                >
                    <Image
                        src="/creator-sidebar-icon.svg"
                        alt="Open Sidebar"
                        width={24}
                        height={24}
                        className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
                    />
                </button>
            )}

            {/* SIDEBAR */}
            <div
                className={`${isMobile
                        ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' fixed'
                        : 'relative'
                    }
          top-0 left-0 z-40 bg-white border-r
          h-[90dvh] transition-all duration-300
          flex flex-col justify-between
          ${isMobile ? 'w-[260px] p-4' : isSidebarOpen ? 'w-[260px] p-4' : 'w-[80px] p-2'}
        `}
            >
                {/* Toggle + Icons container */}
                <div className="flex flex-col items-center gap-4">
                    {/* Desktop toggle button */}
                    {!isMobile && (
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="self-start"
                        >
                            <Image
                                src="/creator-sidebar-icon.svg"
                                alt="Toggle Sidebar"
                                width={24}
                                height={24}
                                className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
                            />
                        </button>
                    )}

                    {/* Navigation items */}
                    <div className="flex flex-col gap-2 mt-12 lg:mt-0">
                        {navItems.map((item) => (
                            <CreatorSidebarNavigation
                                key={item.label}
                                label={item.label}
                                image={item.icon}
                                path={item.path}
                                activeImage={item.activeIcon}
                                showLabel={isSidebarOpen}
                            />
                        ))}
                    </div>
                </div>

                {/* Support item */}
                <div className="mb-3">
                    <CreatorSidebarNavigation
                        label={supportItem.label}
                        image={supportItem.icon}
                        path={supportItem.path}
                        activeImage={supportItem.activeIcon}
                        showLabel={isSidebarOpen}
                    />
                </div>

                {/* Mobile close button */}
                {isMobile && (
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-4 left-4 z-50 bg-[#FAFAFA] rounded-full p-2 mb-6"
                    >
                        <Image
                            src="/creator-sidebar-icon.svg"
                            alt="Close Sidebar"
                            width={24}
                            height={24}
                        />
                    </button>
                )}
            </div>
        </>
    );
}
