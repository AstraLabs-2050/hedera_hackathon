'use client';

import { useState } from 'react';
import CreatorSidebarNavigation from './CreatorSidebarNavigation';
import { X } from 'lucide-react';

type MessageSidebarProps = {
    visible: boolean;
    onClose: () => void;
};

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

export default function MessageSidebar({ visible, onClose }: MessageSidebarProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            {/* Background overlay */}
            <div
                className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out
        ${visible ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar container */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${visible ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Close button */}
                <div className="p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full shadow-md border bg-white border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Navigation items */}
                <div className="flex flex-col gap-2">
                    {navItems.map((item) => (
                        <CreatorSidebarNavigation
                            key={item.label}
                            label={item.label}
                            image={item.icon}
                            path={item.path}
                            activeImage={item.activeIcon}
                            showLabel={visible}
                        />
                    ))}
                </div>

                {/* Support item */}
                <div className="mt-auto mb-6 px-2">
                    <CreatorSidebarNavigation
                        label={supportItem.label}
                        image={supportItem.icon}
                        path={supportItem.path}
                        activeImage={supportItem.activeIcon}
                        showLabel={visible}
                    />
                </div>
            </div>
        </>
    );
}
