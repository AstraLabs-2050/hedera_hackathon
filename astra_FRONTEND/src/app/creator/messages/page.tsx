'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import MessageSidebar from '../../components/messageSidebar'
import ChatSidebar from '../../components/chat/ChatSidebar'
import ChatPanel from '../../components/chat/ChatPanel'
import ChatWindow from '../../components/chat/ChatWindow'

export default function Page() {
    const [showSidebar, setShowSidebar] = useState(false)
    const [escrowBalance, setEscrowBalance] = useState(0)
    const [activeChat, setActiveChat] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('jwt_token')
        if (stored) {
            setToken(stored)
        }
    }, [])

    if (!token) {
        return null // don’t render until token exists
    }

    return (
        <div className="h-screen flex flex-col font-[ClashGrotesk-regular]">
            {/* Navbar */}
            <nav className="flex justify-between items-center h-[10dvh] border-b border-b-[#F2F2F2] px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex gap-4 sm:gap-6 lg:gap-8 items-center">
                    <button
                        onClick={() => setShowSidebar(true)}
                        aria-label="Open menu"
                        className="p-1"
                    >
                        <Image src="/Hamburger.svg" alt="menu" width={24} height={24} />
                    </button>

                    <Image
                        src="/astra-logo.svg"
                        alt="astra logo"
                        width={120}
                        height={30}
                        className="sm:w-[140px] sm:h-[34px] lg:w-[155px] lg:h-[37px] object-contain"
                    />
                </div>

                <Image
                    src="/notification.svg"
                    alt="notifications"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                />
            </nav>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Slide-in menu (not chat list) */}
                <MessageSidebar visible={showSidebar} onClose={() => setShowSidebar(false)} />

                {/* Chat Sidebar (list of chats) */}
                <div
                    className={`
            absolute inset-0 lg:static
            w-full lg:max-w-sm border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${activeChat ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          `}
                >
                    <ChatSidebar
                        activeChat={activeChat}
                        setActiveChat={setActiveChat}
                        token={token}
                        role="maker" // 🔑 role passed here
                    />
                </div>

                {/* Chat Window */}
                <div
                    className={`
            absolute inset-0 lg:static
            flex-1 flex flex-col min-w-0
            transform transition-transform duration-300 ease-in-out
            ${activeChat ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}
                >
                    {activeChat && (
                        <ChatPanel
                            escrowBalance={escrowBalance}
                            onBack={() => setActiveChat(null)}
                            activeChatId={activeChat}
                            token={token}
                            role="maker" // 🔑 role passed here
                        />
                    )}

                    <div className="flex min-h-[80dvh]">
                        {activeChat ? (
                            <ChatWindow
                                conversationId={activeChat}
                                escrowBalance={escrowBalance}
                                setEscrowBalance={setEscrowBalance}
                                makerId=''
                                creatorId=''
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
                                Select a chat to start messaging!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
