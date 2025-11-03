
"use client"
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import MessageStatus from '../../../components/MessageStatus'
import TypingIndicator from '../../../components/TypingIndicator'
import QuickReplies from '../../../components/QuickReplies'
import useChatSocket from '@/app/hooks/useChatSocket'

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: "text" | "image" | "file";
  status: "sending" | "sent" | "delivered" | "read";
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  messages: Message[];
}

function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "online">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: "1",
        participantId: "user1",
        participantName: "John Smith",
        participantAvatar: "/avatar1.svg",
        lastMessage: "Hey, I need help with my NFT collection",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
        unreadCount: 2,
        isOnline: true,
        isTyping: false,
        messages: [
          {
            id: "m1",
            senderId: "user1",
            senderName: "John Smith",
            senderAvatar: "/avatar1.svg",
            content: "Hi there! I need some help with my NFT collection.",
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            isRead: true,
            type: "text",
            status: "read",
          },
          {
            id: "m2",
            senderId: "admin",
            senderName: "Admin",
            senderAvatar: "/admin-avatar.svg",
            content:
              "Hello John! I'd be happy to help you with your NFT collection. What specific issue are you facing?",
            timestamp: new Date(Date.now() - 1000 * 60 * 8),
            isRead: true,
            type: "text",
            status: "read",
          },
          {
            id: "m3",
            senderId: "user1",
            senderName: "John Smith",
            senderAvatar: "/avatar1.svg",
            content:
              "I'm having trouble minting my designs. The payment keeps failing.",
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            isRead: false,
            type: "text",
            status: "delivered",
          },
        ],
      },
      {
        id: "2",
        participantId: "user2",
        participantName: "Sarah Johnson",
        participantAvatar: "/avatar2.svg",
        lastMessage: "Thank you for the quick response!",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 0,
        isOnline: false,
        isTyping: false,
        messages: [
          {
            id: "m4",
            senderId: "user2",
            senderName: "Sarah Johnson",
            senderAvatar: "/avatar2.svg",
            content: "I love the new AI agent feature! It's so helpful.",
            timestamp: new Date(Date.now() - 1000 * 60 * 35),
            isRead: true,
            type: "text",
            status: "read",
          },
          {
            id: "m5",
            senderId: "admin",
            senderName: "Admin",
            senderAvatar: "/admin-avatar.svg",
            content:
              "Thank you for the feedback, Sarah! We're glad you're enjoying the AI agent.",
            timestamp: new Date(Date.now() - 1000 * 60 * 32),
            isRead: true,
            type: "text",
            status: "read",
          },
          {
            id: "m6",
            senderId: "user2",
            senderName: "Sarah Johnson",
            senderAvatar: "/avatar2.svg",
            content: "Thank you for the quick response!",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            isRead: true,
            type: "text",
            status: "read",
          },
        ],
      },
      {
        id: "3",
        participantId: "user3",
        participantName: "Mike Chen",
        participantAvatar: "/avatar3.svg",
        lastMessage: "Can you help me understand the pricing?",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unreadCount: 1,
        isOnline: true,
        isTyping: true,
        messages: [
          {
            id: "m7",
            senderId: "user3",
            senderName: "Mike Chen",
            senderAvatar: "/avatar3.svg",
            content:
              "Can you help me understand the pricing structure for minting NFTs?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            isRead: false,
            type: "text",
            status: "delivered",
          },
        ],
      },
    ];

    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      senderId: "admin",
      senderName: "Admin",
      senderAvatar: "/admin-avatar.svg",
      content: newMessage,
      timestamp: new Date(),
      isRead: true,
      type: "text",
      status: "sending",
    };

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id ? updatedConversation : conv
      )
    );

    setSelectedConversation(updatedConversation);
    setNewMessage("");
    setShowQuickReplies(false);

    setTimeout(() => updateMessageStatus(message.id, "sent"), 1000);
    setTimeout(() => updateMessageStatus(message.id, "delivered"), 2000);
  };

  const updateMessageStatus = (
    messageId: string,
    status: "sending" | "sent" | "delivered" | "read"
  ) => {
    if (!selectedConversation) return;

    const updatedConversation = {
      ...selectedConversation,
      messages: selectedConversation.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id ? updatedConversation : conv
      )
    );

    setSelectedConversation(updatedConversation);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (reply: string) => {
    setNewMessage(reply);
    setShowQuickReplies(false);
  };

  const markAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map((msg) => ({ ...msg, isRead: true })),
            }
          : conv
      )
    );
  };

  const { emit } = useChatSocket({
  role: 'client', // THIS IS IMPORTANT
  onMessageAck: (ack) => {
    // update message status
    updateMessageStatus(ack.clientMessageId, 'delivered');
  },
  onNewMessage: (msg) => {
    // append incoming message
    if (!selectedConversation) return;

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, msg],
      lastMessage: msg.content,
      lastMessageTime: new Date(),
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id ? updatedConversation : conv
      )
    );

    setSelectedConversation(updatedConversation);
    scrollToBottom();
  },
  onTyping: ({ sender }) => {
    if (!selectedConversation) return;
    setSelectedConversation({
      ...selectedConversation,
      isTyping: sender === 'creator',
    });
  },
});

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getFilteredConversations = () => {
    let filtered = conversations.filter(
      (conv) =>
        conv.participantName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (filter) {
      case "unread":
        return filtered.filter((conv) => conv.unreadCount > 0);
      case "online":
        return filtered.filter((conv) => conv.isOnline);
      default:
        return filtered;
    }
  };

  const totalUnreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-lg'>Loading messages...</div>
      </div>
    );
  }

  return (
    <div className='flex h-full bg-white'>
      {/* Conversations Sidebar */}
      <div className='w-[380px] border-r border-[#F2F2F2] flex flex-col'>
        <div className='p-6 border-b border-[#F2F2F2]'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-2xl font-[ClashGrotesk-Medium] font-[600] text-black'>
              Messages
            </h1>
            {totalUnreadCount > 0 && (
              <div className='bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium'>
                {totalUnreadCount}
              </div>
            )}
          </div>

          <div className='relative mb-4'>
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
              🔍
            </div>
            <input
              type='text'
              placeholder='Search conversations...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-black transition-colors'
            />
          </div>

          <div className='flex gap-2'>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === "unread"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              Unread
            </button>
            <button
              onClick={() => setFilter("online")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === "online"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              Online
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {getFilteredConversations().map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                markAsRead(conversation.id);
              }}
              className={`p-4 border-b border-[#F2F2F2] cursor-pointer hover:bg-[#F8F8F8] transition-colors ${
                selectedConversation?.id === conversation.id
                  ? "bg-[#F0F0F0]"
                  : ""
              }`}>
              <div className='flex items-start gap-3'>
                <div className='relative'>
                  <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                    <span className='text-lg font-medium text-gray-600'>
                      {conversation.participantName.charAt(0)}
                    </span>
                  </div>
                  {conversation.isOnline && (
                    <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between mb-1'>
                    <h3 className='font-[ClashGrotesk-Medium] font-[500] text-black truncate'>
                      {conversation.participantName}
                    </h3>
                    <span className='text-sm text-gray-500 flex-shrink-0'>
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <p className='text-sm text-gray-600 truncate'>
                      {conversation.isTyping ? (
                        <span className='italic text-blue-500'>typing...</span>
                      ) : (
                        conversation.lastMessage
                      )}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <div className='bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium ml-2'>
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className='flex-1 flex flex-col'>
          <div className='p-6 border-b border-[#F2F2F2] bg-white'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                    <span className='text-lg font-medium text-gray-600'>
                      {selectedConversation.participantName.charAt(0)}
                    </span>
                  </div>
                  {selectedConversation.isOnline && (
                    <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
                  )}
                </div>

                <div>
                  <h2 className='font-[ClashGrotesk-Medium] font-[600] text-black'>
                    {selectedConversation.participantName}
                  </h2>
                  <p className='text-sm text-gray-500'>
                    {selectedConversation.isTyping ? (
                      <span className='text-blue-500'>typing...</span>
                    ) : selectedConversation.isOnline ? (
                      "Online"
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button className='p-2 text-gray-500 hover:text-black transition-colors'>
                  📞
                </button>
                <button className='p-2 text-gray-500 hover:text-black transition-colors'>
                  📹
                </button>
                <button className='p-2 text-gray-500 hover:text-black transition-colors'>
                  ℹ️
                </button>
              </div>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-6 space-y-4'>
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === "admin" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] ${message.senderId === "admin" ? "order-2" : "order-1"}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.senderId === "admin"
                        ? "bg-black text-white rounded-br-md"
                        : "bg-[#F5F5F5] text-black rounded-bl-md"
                    }`}>
                    <p className='text-sm leading-relaxed'>{message.content}</p>
                  </div>
                  <div
                    className={`mt-1 ${
                      message.senderId === "admin" ? "text-right" : "text-left"
                    }`}>
                    {message.senderId === "admin" ? (
                      <MessageStatus
                        status={message.status}
                        timestamp={message.timestamp}
                      />
                    ) : (
                      <p className='text-xs text-gray-500'>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {selectedConversation.isTyping && (
              <TypingIndicator
                userName={selectedConversation.participantName}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className='p-6 border-t border-[#F2F2F2] bg-white relative'>
            <QuickReplies
              onSelectReply={handleQuickReply}
              isVisible={showQuickReplies}
            />

            <div className='flex items-end gap-3'>
              <button
                onClick={() => fileInputRef.current?.click()}
                className='p-3 text-gray-500 hover:text-black transition-colors'>
                📎
              </button>

              <button
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                className='p-3 text-gray-500 hover:text-black transition-colors'>
                ⚡
              </button>

              <div className='flex-1 relative'>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Type your message...'
                  rows={1}
                  className='w-full p-3 border border-[#E5E5E5] rounded-lg resize-none focus:outline-none focus:border-black transition-colors'
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className='p-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'>
                ➤
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type='file'
            className='hidden'
            multiple
            onChange={(e) => {
              console.log("Files selected:", e.target.files);
            }}
          />
        </div>
      ) : (
        <div className='flex-1 flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='text-6xl mb-4 opacity-50'>💬</div>
            <h3 className='text-lg font-[ClashGrotesk-Medium] font-[500] text-gray-600 mb-2'>
              No conversation selected
            </h3>
            <p className='text-gray-500'>
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
