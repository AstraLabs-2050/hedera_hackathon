"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ChatpaySidebar from "../../components/ChatpaySidebar";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatPanel from "../../components/chat/ChatPanel";
import ChatpayWindow from "../../components/chat/ChatpayWindow";
import api from "@/utils/api.class";

// 👇 Move search params usage into child
function ChatPayInner() {
  const params = useSearchParams();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [escrowBalance, setEscrowBalance] = useState(750);
  const [starting, setStarting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // pick chatId from URL
  useEffect(() => {
    const chatIdFromUrl = params.get("chatId");
    if (chatIdFromUrl) {
      setActiveChat(chatIdFromUrl);
    }
  }, [params]);

  // load token from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("jwt_token");
    if (stored) {
      setToken(stored);
    }
  }, []);

  if (!token) return null;

  const handleNew = async () => {
    setStarting(true);
    try {
      const res = await api.startChat();
      if (res.status) {
        window.location.href = `/dashboard/chatPay?chatId=${res.data.id}`;
      } else {
        throw new Error("Failed to start chat");
      }
    } catch (e: any) {
      throw e.message || "Failed to create chat";
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className='h-screen flex flex-col font-[ClashGrotesk-regular]'>
      {/* Navbar */}
      <nav className='flex justify-between items-center h-[10dvh] border-b border-b-[#F2F2F2] px-4 sm:px-6 lg:px-8 py-3 sm:py-4'>
        <div className='flex gap-4 sm:gap-6 lg:gap-8 items-center'>
          <button
            onClick={() => setShowSidebar(true)}
            aria-label='Open menu'
            className='p-1'>
            <Image src='/Hamburger.svg' alt='menu' width={24} height={24} />
          </button>

          <Image
            src='/ASTRA-logo.svg'
            alt='astra logo'
            width={120}
            height={30}
            className='sm:w-[140px] sm:h-[34px] lg:w-[155px] lg:h-[37px] object-contain'
          />
        </div>

        <div className='flex items-center gap-3'>
          <Image
            src='/notification.svg'
            alt='notifications'
            width={15}
            height={15}
            className='cursor-pointer'
          />

          <div className='hidden md:flex items-center justify-center border border-primary gap-3 rounded-[50px] py-[10px] px-[16px]'>
            <button
              onClick={handleNew}
              className='font-[ClashGrotesk-Medium] font-[500] text-sm hover:cursor-pointer'>
              {starting ? "Creating..." : "Create New Design"}
            </button>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className='flex flex-1 overflow-hidden relative'>
        {/* Sidebar */}
        <ChatpaySidebar
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
        />

        {/* Chat Sidebar */}
        <div
          className={`
            absolute inset-0 lg:static
            w-full lg:max-w-sm border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${activeChat ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
          `}>
          <ChatSidebar
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            token={token}
            role='creator'
          />
        </div>

        {/* Chat Window */}
        <div
          className={`
            absolute inset-0 lg:static
            flex-1 flex flex-col min-w-0
            transform transition-transform duration-300 ease-in-out
            ${activeChat ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          `}>
          {activeChat && (
            <ChatPanel
              escrowBalance={escrowBalance}
              onBack={() => setActiveChat(null)}
              activeChatId={activeChat}
              token={token}
              role='creator'
            />
          )}
          <div className='flex min-h-[80dvh]'>
            {activeChat ? (
              <ChatpayWindow
                conversationId={activeChat}
                escrowBalance={escrowBalance}
                setEscrowBalance={setEscrowBalance}
                makerId=''
                creatorId=''
              />
            ) : (
              <div className='flex-1 flex items-center justify-center text-gray-400 text-xl'>
                Select a chat to start messaging!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 👇 Wrap in Suspense here
export default function Page() {
  return (
    <Suspense fallback={<div>Loading chat page...</div>}>
      <ChatPayInner />
    </Suspense>
  );
}
