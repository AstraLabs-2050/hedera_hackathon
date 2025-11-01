'use client';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

export interface ChatPreview {
    email: string;
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    title: string;
    job: any;
    avatar: string;
    unreadCount: number;
}

const fetcher = async (url: string, token: string) => {
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load chats');
    return res.json();
};

export const useChats = (
    token: string | null,
    role: 'maker' | 'creator',
    activeChat: string | null
) => {
    const { data, error, isLoading, mutate } = useSWR(
        token
            ? [`${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/my-chats`, token]
            : null,
        ([url, token]) => fetcher(url, token),
        { refreshInterval: 15000 }
    );

    const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

    // Initialize unread counts from backend
    useEffect(() => {
        if (!Array.isArray(data?.data)) return;
        const updated: Record<string, number> = {};
        data.data.forEach((chat: any) => {
            updated[chat.id] = chat.unreadCount ?? 0;
        });
        setUnreadMap(prev => ({ ...updated, ...prev }));
    }, [data]);

    // Listen for WebSocket events
    useEffect(() => {
        if (!token) return;

        const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL as string);

        socket.onopen = () => {
            console.log('✅ Connected to WebSocket for chats');
            socket.send(JSON.stringify({ type: 'AUTH', token }));
        };

        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                // Handle new chat message
                if (msg.type === 'NEW_MESSAGE') {
                    const { chatId, content, senderId, timestamp } = msg.payload;

                    setUnreadMap(prev => {
                        // If user has this chat open → don't increment
                        if (activeChat === chatId) {
                            return { ...prev, [chatId]: 0 };
                        }
                        // Otherwise increment unread
                        return { ...prev, [chatId]: (prev[chatId] ?? 0) + 1 };
                    });

                    // Update last message & time in cache
                    mutate((current: any) => {
                        if (!current?.data) return current;
                        return {
                            ...current,
                            data: current.data.map((chat: any) =>
                                chat.id === chatId
                                    ? {
                                        ...chat,
                                        lastMessage: {
                                            ...chat.lastMessage,
                                            content,
                                            senderId,
                                            createdAt: timestamp,
                                        },
                                        lastMessageAt: timestamp,
                                    }
                                    : chat
                            ),
                        };
                    }, false);
                }
            } catch (err) {
                console.error('❌ Error parsing WS message', err);
            }
        };

        return () => {
            socket.close();
        };
    }, [token, activeChat, mutate]);

    // Build chats merged with unread counts
    const chats: ChatPreview[] = Array.isArray(data?.data)
        ? data.data.map((chat: any) => {
            const lastMsg = chat.lastMessage;
            let previewText = 'No messages yet';

            if (lastMsg) {
                if (lastMsg.content && lastMsg.content.trim() !== '') {
                    previewText = lastMsg.content;
                } else if (lastMsg.type === 'image') {
                    previewText = '[Image]';
                }
            }

            const otherUser = role === 'maker' ? chat.creator : chat.maker;

            return {
                id: chat.id,
                name: otherUser?.fullName || 'Unknown',
                avatar: otherUser?.avatar || '/user-fill.png',
                lastMessage: previewText,
                time: new Date(chat.lastMessageAt || chat.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                title: chat.job?.title || 'No job title',
                job: chat.job || '',
                unreadCount: unreadMap[chat.id] ?? 0,
            };
        })
        : [];

    // Reset unread when opening chat
    const openChat = (chatId: string) => {
        setUnreadMap(prev => ({ ...prev, [chatId]: 0 }));
    };

    return { chats, isLoading, error, openChat };
};
