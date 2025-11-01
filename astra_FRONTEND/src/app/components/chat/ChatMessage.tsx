"use client";

import React from "react";
import Image from "next/image";

interface ChatMessageProps {
    message: string;
    time: string;
    isSender: boolean; // true = current user, false = other user
    senderType?: "maker" | "creator" | "system";
    avatar?: string;  
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, time, isSender, senderType, avatar }) => {
    if (senderType === "system") {
        // System message = centered status style
        return (
            <div className="flex justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full">
                    {message} · {time}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex items-end w-full mb-4 px-4 ${
                isSender ? "justify-end" : "justify-start"
            }`}
        >
            {/* Left avatar for receiver */}
            {!isSender && avatar && (
                <Image
                    src={avatar}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full mr-2"
                />
            )}

            {/* Message bubble */}
            <div
                className={`max-w-[60%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isSender
                        ? "bg-[#3F37C9] text-white rounded-br-none"
                        : "bg-[#F2F2F2] text-gray-800 rounded-bl-none"
                }`}
            >
                <p className="text-black text-base">{message}</p>
                <span className="block text-xs text-gray-400 mt-1 text-right">{time}</span>
            </div>

            {/* Right avatar for sender */}
            {isSender && avatar && (
                <Image
                    src={avatar}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full ml-2"
                />
            )}
        </div>
    );
};

export default ChatMessage;
