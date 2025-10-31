'use client';
import React from 'react';
import Image from 'next/image';
import { useChats } from '../../hooks/useChats';

type Props = {
    escrowBalance: number;
    onBack?: () => void;
    activeChatId: string | null;
    token: string | null;
    role: "maker" | "creator";   // 👈 must pass
};

export default function ChatPanel({
    escrowBalance,
    onBack,
    activeChatId,
    token,
    role,
}: Props) {
    const { chats } = useChats(token || "", role, activeChatId);

    const selectedChat = chats.find((chat) => chat.id === activeChatId);

    return (
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-b-[#F2F2F2] gap-4 sm:gap-6 lg:gap-8 h-[10dvh]">
            {/* Left side: Back + Profile */}
            <div className="flex items-center gap-3 sm:gap-6">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="lg:hidden flex items-center justify-center p-1"
                    >
                        <Image src="/back.svg" alt="back" width={20} height={20} />
                    </button>
                )}

                <Image
                    src={selectedChat?.avatar || '/profilePicture1.png'}
                    alt={selectedChat?.name || 'Profile picture'}
                    width={30}
                    height={30}
                    className="sm:w-[35px] sm:h-[35px] lg:w-[35px] lg:h-[35px] rounded-full object-cover"
                />

                <span className="min-w-0">
                    <h3 className="text-base sm:text-lg lg:text-xl font-[ClashGrotesk-bold] truncate">
                        {selectedChat?.name || 'Unknown'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#828282] truncate">
                        {selectedChat?.title || 'No job title'}
                    </p>
                </span>
            </div>

            {/* Escrow Balance (always visible) */}
            <div className="flex items-center gap-2 justify-center p-2 bg-gradient-radial from-[#3F37C9] to-[#4361EE] h-10 sm:h-12 min-w-[100px] sm:min-w-[128px] rounded-full text-white flex-shrink-0">
                <Image
                    src="/payment.svg"
                    alt="Payment Icon"
                    width={20}
                    height={20}
                    className="sm:w-[24px] sm:h-[24px]"
                />
                <p className="text-sm sm:text-base font-medium truncate">
                    ${escrowBalance}
                </p>
            </div>
        </div>
    );
}
