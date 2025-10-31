"use client";

import React, { use } from "react";
import { StreamProvider } from "./../../component/StreamProvider";
import ChatSidebar from "./../../component/ChatSidebar";
import ChatWindow from "../../component/ChatWindow";

const ChatPage = ({ params }: { params: Promise<{ chatId: string }> }) => {
  const { chatId } = use(params);

  // Handler for when a new chat is created from sidebar
  const handleNewChat = (newChatId: string) => {
    // This will be handled by the navigation in ChatSidebar
    console.log("New chat created:", newChatId);
  };

  // Handler for when a chat is deleted
  const handleChatDeleted = (deletedChatId: string) => {
    console.log("Chat deleted:", deletedChatId);
    // Additional cleanup logic can go here if needed
  };

  return (
    <div className='relative h-full w-full flex overflow-y-hidden'>
      <StreamProvider>
        <main className='flex-1 w-full flex flex-col h-full'>
          <ChatWindow chatId={chatId} />
        </main>
      </StreamProvider>

      <ChatSidebar
        activeChatId={chatId}
        onNewChat={handleNewChat}
        onChatDeleted={handleChatDeleted}
      />
    </div>
  );
};

export default ChatPage;
