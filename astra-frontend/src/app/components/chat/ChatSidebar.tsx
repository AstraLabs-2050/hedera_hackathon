'use client';

import Image from 'next/image';
import Input from '../input';
import { useChats, ChatPreview } from '../../hooks/useChats';
import { useState } from 'react';

interface Props {
    role: 'maker' | 'creator';
    activeChat: string | null;
    setActiveChat: (
        id: string,
        userInfo: { avatar: string; fullName: string; jobTitle: string }
    ) => void;
    token: string | null;
}

export default function ChatSidebar({ role, activeChat, setActiveChat, token }: Props) {
    // 👇 now hook also receives activeChat
    const { chats, isLoading, error, openChat } = useChats(token, role, activeChat);
    const [search, setSearch] = useState('');

    // Filter chats by search
    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <aside className="lg:max-w-sm w-full border-r border-gray-200 h-[90dvh] overflow-y-auto p-2">
            {/* Search input */}
            <div className="relative w-full lg:max-w-[334px] mt-4 mb-4">
                <Input
                    placeholder="Search messages"
                    name="search"
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="rounded-full w-full focus:ring-2 focus:ring-black"
                />
                <Image
                    src="/searchIcon.svg"
                    alt="Search"
                    width={20}
                    height={20}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                />
            </div>

            {/* Loading / error / empty states */}
            {isLoading && <p className="p-4 text-sm text-gray-500">Loading chats…</p>}
            {error && <p className="p-4 text-sm text-red-500">Failed to load chats.</p>}
            {!isLoading && filteredChats.length === 0 && (
                <p className="p-4 text-sm text-gray-400">No chats found</p>
            )}

            {/* Chat list */}
            <ul className="mt-4">
                {filteredChats.map((chat: ChatPreview) => (
                    <li
                        key={chat.id}
                        onClick={() => {
                            setActiveChat(chat.id, {
                                avatar: chat.avatar,
                                fullName: chat.name,
                                jobTitle: chat.title,
                            });
                            openChat(chat.id); // 👈 reset unread count instantly
                        }}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition 
                            ${activeChat === chat.id ? 'bg-gray-100 rounded-md' : 'hover:bg-gray-50'}`}
                    >
                        <Image
                            src={chat.avatar}
                            alt={chat.name}
                            width={48}
                            height={48}
                            className="rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium">{chat.name}</p>
                            <h4 className="text-sm font-bold">{chat.title}</h4>
                            <p className="text-sm text-[#4F4F4F] truncate w-40">
                                {chat.lastMessage}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-[#4F4F4F]">{chat.time}</span>
                            {chat.unreadCount > 0 && (
                                <span className="flex items-center justify-center w-6 h-6 text-[10px] font-bold text-white bg-black rounded-full">
                                    {chat.unreadCount}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
