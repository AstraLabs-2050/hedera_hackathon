'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, Sender, MessageKind } from "@/types/chat";

type Role = 'maker' | 'creator';

export default function useChatSocket({
    role = 'maker',
    token,
    conversationId,
    onMessageAck,
    onNewMessage,
    onTyping,
    onError,
}: {
    role?: Role;
    token?: string;
    conversationId?: string;
    onMessageAck?: (ack: any) => void;
    onNewMessage?: (msg: any) => void;
    onTyping?: (typingData: { sender: Role }) => void;
    onError?: (err: any) => void;
}) {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        if (!token || !conversationId) return;

        // Connect to backend
        const socket = io(`${baseurl}/chat`, {
            auth: { token },
            transports: ['websocket'],
        });
        socketRef.current = socket;

        // On connect
        socket.on('connect', () => {
            console.log('✅ Connected to chat WS');
            setConnected(true);

            // Join a room specific to this conversation
            socket.emit('joinChat', { chatId: conversationId, role });
            console.log('➡️ joinChat sent for', conversationId);
        });

        // On disconnect
        socket.on('disconnect', () => {
            console.log('❌ Disconnected');
            setConnected(false);
        });

        // Incoming message
        // socket.on('newMessage', (message) => {
        //     console.log('📩 newMessage', message);
        //     onNewMessage?.(message);
        // });

        socket.on("newMessage", (message) => {
            // console.log("📩 newMessage", message);

            let mappedKind: MessageKind = "user";

            // ✅ Detect system messages from backend
            if (message.type === "system" && message.actionType) {
                switch (message.actionType) {
                    case "payment_request":
                    case "payment_approved":
                        mappedKind = "payment";
                        break;
                    case "deliveryMeasurement":
                        mappedKind = "action.deliveryMeasurement";
                        break;
                    default:
                        mappedKind = "user";
                }

                // Pass formatted message to UI
                onNewMessage?.({
                    id: message.id,
                    kind: mappedKind,
                    sender: message.sender?.userType ?? message.senderId ?? "system",
                    senderId: message.senderId,
                    time: message.createdAt ?? new Date().toISOString(),
                    status: "sent",
                    data: {
                        text: message.content ?? "New system message",
                        ...message.data,
                    },
                });
            } else {
                // Normal user messages
                onNewMessage?.(message);
            }
        });


        //         socket.on('quickAction', (action) => {
        //     console.log('⚡ quickAction received', action);
        //     onNewMessage?.({
        //         id: `qa-${Date.now()}`,
        //         kind: `action.${action.actionType}`,
        //         sender: action.from,
        //         time: new Date().toISOString(),
        //         data: action.data,
        //     });
        // });

        // Message ack

        socket.on('quickAction', (action) => {
            console.log('⚡ quickAction received', action);

            let mappedKind: MessageKind = "user";

            console.log("💬 Triggering onNewMessage with:", {
                mappedKind,
                action,
            });

            // map backend action types to frontend kinds
            switch (action.actionType) {
                case "payment_request":
                    mappedKind = "action.payment";
                    break;
                case "deliveryMeasurement":
                    mappedKind = "action.deliveryMeasurement";
                    break;
                default:
                    mappedKind = "user";
            }

            onNewMessage?.({
                id: `qa-${Date.now()}`,
                kind: mappedKind,
                sender: action.from,
                time: new Date().toISOString(),
                data: {
                    text: action.data?.text || action.content || "Kindly approve payment",
                    ...action.data,
                },
            });
        });

        socket.on('messageSent', (ack) => {
            console.log('✅ messageSent', ack);
            onMessageAck?.(ack);
        });

        // Typing indicator
        socket.on('userTyping', ({ userId, isTyping }) => {
            console.log(`${userId} ${isTyping ? 'typing...' : 'stopped'}`);
            onTyping?.({ sender: userId as Role });
        });

        // Confirm room joined
        socket.on('joinedChat', ({ chatId }) => {
            console.log('🎉 Successfully joined chat', chatId);
        });

        // Errors
        socket.on('error', (err) => {
            console.error('⚠️ Socket error', err);
            onError?.(err);
        });

        // Cleanup
        return () => {
            socket.emit('leaveChat', { chatId: conversationId });
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, conversationId, role]);

    // Emit wrapper
    const emit = useCallback(
        (event: string, payload: any) => {
            const socket = socketRef.current;
            if (!socket) return;

            switch (event) {
                case 'message:send':
                case "sendMessage": {
                    const base = {
                        chatId: payload.conversationId,
                        content: payload.content ?? "",
                        type: payload.type ?? "text",
                        clientMessageId: payload.clientMessageId,
                        sender: payload.sender ?? role,
                    };

                    if (payload.type === "delivery_and_measurements") {
                        // ✅ backend supports this type
                        socket.emit("sendMessage", {
                            ...base,
                            type: "delivery_and_measurements",
                            data: payload.data ?? {},
                        });
                    } else if (payload.kind === "action.completed") {
                        // ✅ Treat as plain text since backend enum doesn't support it
                        socket.emit("sendMessage", {
                            chatId: payload.conversationId,
                            type: "text",
                            content: "Thank you for doing a good job!", // or payload.content if you want dynamic
                            clientMessageId: payload.clientMessageId,
                            sender: payload.sender ?? role,
                            data: payload.data ?? {},
                        });
                    }
                    else {
                        // normal text / image
                        socket.emit("sendMessage", base);
                    }
                    break;
                }

                case 'quickAction': {
                    const isPaymentRequest = payload.actionType === "payment_request";

                    socket.emit('quickAction', {
                        chatId: payload.conversationId,
                        type: "system",
                        actionType: payload.actionType ?? (isPaymentRequest ? "payment_request" : undefined),
                        content: isPaymentRequest
                            ? payload.data?.content ?? "Kindly approve payment"
                            : payload.data?.content ?? "",
                        from: payload.sender ?? role,
                        data: payload.data ?? {},
                    });
                    break;
                }
                case "typing":
                    socket.emit("typing", {
                        chatId: payload.conversationId,
                        isTyping: payload.isTyping,
                        sender: payload.sender ?? role, // ✅ consistent
                    });
                    break;
                default:
                    socket.emit(event, payload);
            }
        },
        [role]
    );

    return { emit, connected };
}