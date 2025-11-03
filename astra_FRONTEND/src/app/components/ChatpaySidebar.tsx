'use client';

import { useState } from 'react';
import ChatpaySideBarNavigation from './ChatpaySidebarNavigation';
import { X } from 'lucide-react';

type ChatPaySidebarProps = {
    visible: boolean;
    onClose: () => void;
};

const navItems = [
    { label: 'Dashboard', icon: '/dashboard.svg', path: '/dashboard' },
    { label: 'Design', icon: '/inventory.svg', path: '/dashboard/design' },
    { label: 'AI Agent', icon: '/agent.svg', path:  "/dashboard/aiagent/chat" },
    { label: 'Applications', icon: '/ongoing-jobs-icon.svg', path: '/dashboard/applications' },
    { label: 'Chat Pay', icon: '/message.svg', path: '/dashboard/chatPay' },
    { label: 'Account Settings', icon: '/settings.svg', path: '/dashboard/Settings' },
];

const supportItem = {
    label: 'Help & Support',
    icon: '/help-support-icon.svg',
    path: '',
};

export default function ChatPaySidebar({ visible, onClose }: ChatPaySidebarProps) {
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
                <div className="flex flex-col gap-2 px-6 py-2">
                    {navItems.map((item) => (
                        <ChatpaySideBarNavigation
                            key={item.label}
                            label={item.label}
                            image={item.icon}
                            path={item.path}
                            showLabel={visible}
                        />
                    ))}
                </div>

                {/* Support item */}
                <div className="mt-auto mb-6 px-2">
                    <ChatpaySideBarNavigation
                        label={supportItem.label}
                        image={supportItem.icon}
                        path={supportItem.path}
                        showLabel={visible}
                    />
                </div>
            </div>
        </>
    );
}
