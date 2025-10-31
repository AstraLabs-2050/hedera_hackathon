'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ChatpayInput from './ChatpayInput';
import DeliveryMeasurementFormModal from '../../components/DeliveryMeasurementFormModal';
import { sendOptimisticMessage, normalizeMessage } from '@/utils/chat';
import { AVATAR_MAKER, AVATAR_CREATOR } from '@/utils/avatars';
import { useSearchParams } from 'next/navigation';
import { fetchMessages } from '../../../utils/fetchMessages';
import type { ChatMessage, UserTextMsg, ImageMsg, Sender, MessageKind } from '@/types/chat';
import useChatSocket from '@/app/hooks/useChatSocket';
import SystemAccepted from '../messages/SystemAccepted';
import PaymentMessage from '../messages/PaymentMessage';
import ActionCompleted from '../messages/ActionCompleted';
import ActionDeliveryMeasurementMessage from '../messages/ActionDeliveryMeasurementMessage';
import EscrowPayment from '../messages/EscrowPayment';
import UserMessage from '../messages/UserMessage';
import DeliveryMeasurementCard from '../messages/DeliveryMeasurementCard';
import EscrowRelease from '../messages/EscrowRelease';
import ActionPaymentMessage from '../messages/ActionPaymentMessage';

function generateId() {
    return typeof crypto !== 'undefined' && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `id-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

const nowIso = () => new Date().toISOString();

type Props = {
    conversationId: string;
    escrowBalance: number;
    setEscrowBalance: React.Dispatch<React.SetStateAction<number>>;
    makerId: string;
    creatorId: string;
};

export default function ChatpayWindow({ conversationId, escrowBalance, setEscrowBalance, makerId, creatorId }: Props) {
    const [deliveryMeasurementOpen, setDeliveryMeasurementOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [sender: string]: boolean }>({});
    const [emitFn, setEmitFn] = useState<((event: string, data?: any) => void) | null>(null);
    // Keep track of optimistic messages by clientMessageId
    const optimisticMessagesRef = useRef<{ [clientMessageId: string]: any }>({});
    const containerRef = useRef<HTMLDivElement | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("user_id") : null;
    const currentRole = typeof window !== "undefined"
        ? (localStorage.getItem("role") as "maker" | "creator")
        : null;

    // Auto scroll
    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // }, [messages]);

//     useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
// }, []);

// // Auto-scroll on new messages only if user is near the bottom
// useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;

//     const isAtBottom =
//         container.scrollHeight - container.scrollTop - container.clientHeight < 50; // near bottom

//     if (isAtBottom) {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }
// }, [messages]);

useEffect(() => {
    const container = containerRef.current;
    const end = messagesEndRef.current;

    if (!container || !end) return;

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}, [messages]);

    // Fetch initial messages
    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (!conversationId || !token || !currentUserId) return;

        fetchMessages(conversationId, token, currentRole, currentUserId)
            .then((msgs) => setMessages(msgs))
            .catch(err => console.error("Failed to load messages:", err));
    }, [conversationId, currentUserId, currentRole]);

    // Socket callbacks
    const onMessageAck = useCallback((ack: any) => {
        setMessages(prev =>
            prev.map(m =>
                m.clientMessageId === ack.clientMessageId
                    ? { ...m, id: ack.serverMessageId ?? m.id, status: 'sent', time: ack.createdAt ?? m.time }
                    : m
            )
        );
    }, []);

    const onNewMessage = useCallback((raw: any) => {
        const normalized = normalizeMessage(raw);

        setMessages(prev => {
            // Avoid duplicate server messages
            if (normalized.id && prev.some(m => m.id === normalized.id)) return prev;

            // Match optimistic → server ack using clientMessageId
            if (normalized.clientMessageId) {
                const idx = prev.findIndex(m => m.clientMessageId === normalized.clientMessageId);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], ...normalized, status: 'sent' };
                    return updated;
                }
            }

            return [...prev, normalized].sort(
                (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
            );
        });
    }, []);



    // const onNewMessage = useCallback((raw: any) => {
    //     const serverId = raw.id ?? raw.serverMessageId;
    //     const clientMessageId = raw.clientMessageId ?? raw.clientId;
    //     const content = raw.content ?? raw.text ?? '';
    //     const isImage = typeof content === 'string' && content.startsWith('http');

    //     // Correct sender logic
    //     // ✅ Map senderId directly to role
    //     const sender: 'maker' | 'creator' =
    //         raw.senderId === makerId ? 'maker' : 'creator';


    //     const normalized: ChatMessage = {
    //         id: serverId,
    //         kind: raw.kind ?? 'user',
    //         sender,
    //         senderId: raw.senderId,
    //         time: raw.createdAt ?? nowIso(),
    //         status: 'sent',
    //         data: {
    //             text: isImage ? '' : content,
    //             imageUrl: isImage ? content : undefined,
    //             avatar: sender === 'creator' ? AVATAR_CREATOR : AVATAR_CLIENT,
    //             ...raw.data,
    //         },
    //         ...(clientMessageId ? { clientMessageId } : {}),
    //     };

    //     setMessages(prev => {
    //         if (serverId && prev.some(m => m.id === serverId)) return prev;

    //         if (clientMessageId) {
    //             const idx = prev.findIndex(m => m.clientMessageId === clientMessageId);
    //             if (idx !== -1) {
    //                 const updated = [...prev];
    //                 updated[idx] = { ...updated[idx], ...normalized, status: 'sent', id: serverId ?? updated[idx].id };
    //                 return updated;
    //             }
    //         }

    //         return [...prev, normalized].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    //     });
    // }, [currentUserId, currentRole]);

    const { emit } = useChatSocket({
        token: localStorage.getItem('jwt_token') ?? undefined,
        conversationId,
        onMessageAck,
        onNewMessage,
        onTyping: ({ sender, isTyping }: { sender: 'maker' | 'creator', isTyping: boolean }) => {
            if (!sender) return;
            setTypingUsers(prev => ({ ...prev, [sender]: isTyping }));

            // Optional: auto-clear after 2s if isTyping is true
            if (isTyping) {
                setTimeout(() => setTypingUsers(prev => ({ ...prev, [sender]: false })), 2000);
            }
        },
        onError: err => console.error('⚠️ Chat socket error', err),
    });

    useEffect(() => setEmitFn(() => emit), [emit]);

    // Actions
    const handleAction = (kind: 'deliveryMeasurement' | 'completion') => {
        if (kind === 'deliveryMeasurement') {
            setDeliveryMeasurementOpen(true);
            // sendOptimisticMessage(setMessages, emitFn, {
            //     sender: currentRole!,
            //     kind: 'action.deliveryMeasurement',
            //     conversationId,
            // }
            // );
        }

        if (kind === 'completion') {
            const clientMessageId = generateId();

            // Optimistic UI
            sendOptimisticMessage(setMessages, emitFn, {
                sender: 'creator',
                kind: 'action.completed',
                data: {},
                clientMessageId,
                conversationId,
            });

            // API call to backend
            const token = localStorage.getItem("jwt_token") ?? "";
            if (token) {
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${conversationId}/complete-job`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })
                    .then(async (res) => {
                        if (!res.ok) throw new Error(`Failed to mark complete: ${res.status}`);
                        const json = await res.json();
                        console.log("✅ Job completed:", json);

                        // Emit socket event
                        emitFn?.("sendMessage", {
                            conversationId,
                            kind: "action.completed", // marker for frontend
                            type: "text",             // backend fallback
                            clientMessageId,
                            sender: 'creator',             // "maker" or "creator"
                            data: {},                 // optional extra
                        });

                    })
                    .catch((err) => {
                        console.error("❌ completion failed", err);
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.clientMessageId === clientMessageId
                                    ? { ...m, status: "failed" }
                                    : m
                            )
                        );
                    });
            }
        }
    };


    const handleMilestoneRelease = (milestone: string, amount: string) => {
        sendOptimisticMessage(setMessages, emitFn, {
            sender: currentRole!,
            kind: 'escrow.release',
            data: {
                projectTitle: 'AstroWRLD Summer II',
                description: `Releasing milestone ${milestone}`,
                outfitBalance: `$${escrowBalance}`,
                amount: `$${amount}`,
                milestone,
                status: 'Pending',
            },
            conversationId,
        });
    };

    const parseMaybeNumber = (v?: string) => {
        if (v === undefined || v === null || v === '') return undefined;
        const n = Number(String(v).trim());
        return Number.isFinite(n) ? n : undefined;
    };



    // Render
    return (
        <div className="flex flex-col h-full bg-white w-full">
            <div ref={containerRef} className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.map((msg, index) => {
                    const key = msg.id || msg.clientMessageId || `msg-${index}`;
                    switch (msg.kind) {
                        case 'system.accepted': return <SystemAccepted
                            key={key}
                            msg={msg}
                        />;
                        case 'payment':
                            return <PaymentMessage
                                key={key}
                                msg={msg}
                            />;
                        case 'escrow.payment':
                            return <EscrowPayment
                                key={key}
                                msg={msg}
                            />;
                        case 'escrow.release':
                            return (
                                <EscrowRelease
                                    key={key}
                                    msg={msg}
                                    onRelease={(amount) => {
                                        const paymentMsg = {
                                            id: generateId(),
                                            kind: 'payment',
                                            sender: 'system',
                                            time: nowIso(),
                                            data: { payerName: 'Paulina', amount },
                                        } as any;
                                        setMessages(prev => [...prev, paymentMsg]);
                                        setEscrowBalance(prev => prev - parseFloat(amount.replace('$', '')));
                                    }}
                                />
                            );
                        case 'action.payment':
                            return <ActionPaymentMessage
                                key={key}
                                msg={msg}
                                avatarUrl={msg.data.avatar || (msg.sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR)}
                                // avatarUrl={AVATAR_CREATOR}
                                onApprove={() =>
                                    console.log("⚡ Dummy approve")}
                            />;
                        case 'action.deliveryMeasurement':
                            return <ActionDeliveryMeasurementMessage
                                key={key}
                                msg={msg}
                                onOpenForm={() => setDeliveryMeasurementOpen(true)}
                                avatarUrl={msg.data.avatar || (msg.sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR)}
                                // avatarUrl={AVATAR_CREATOR}
                                viewerRole='creator'
                            />;
                        case 'action.completed':
                            return <ActionCompleted
                                key={key}
                                msg={msg}
                                avatarUrl={msg.data.avatar || (msg.sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR)}
                            // avatarUrl={AVATAR_CREATOR}
                            />;
                        case 'deliveryMeasurement.card':
                            return (
                                <DeliveryMeasurementCard
                                    key={key}
                                    msg={msg}
                                    onRetry={() => sendOptimisticMessage(setMessages, emitFn, {
                                        sender: currentRole!,
                                        kind: 'deliveryMeasurement.card',
                                        data: msg.data,
                                        replaceId: msg.id,
                                        conversationId,
                                    })}
                                />
                            );
                        case 'user':
                        default:
                            return (
                                <UserMessage
                                    key={key}
                                    msg={msg as UserTextMsg}
                                    // avatarUrl={msg.data.avatar}
                                    currentRole={currentRole!} // ✅ always viewer's role
                                    onRetry={(clientMessageId?: string) => {
                                        sendOptimisticMessage(setMessages, emitFn, {
                                            sender: currentRole!,
                                            content: (msg as any).data?.text ?? '',
                                            kind: 'user',
                                            clientMessageId,
                                            conversationId,
                                        });
                                        setMessages(prev => prev.filter(m => m.id !== msg.id));
                                    }}
                                />
                            );
                    }
                })}

                {/* Typing indicator */}
                {/* {Object.entries(typingUsers).map(([sender, isTyping]) =>
    isTyping && (
        <div key={sender}>
            {sender === 'maker' ? 'Maker' : 'Creator'} is typing...
        </div>
    )
)} */}


                <div ref={messagesEndRef} />
            </div>

            <ChatpayInput
                chatId={conversationId}
                token={localStorage.getItem('jwt_token') ?? ''}
                avatarMaker={AVATAR_MAKER}
                avatarCreator={AVATAR_CREATOR}
                onSend={(text) => {
                    if (!text.trim()) return;
                    const clientMessageId = generateId();
                    sendOptimisticMessage(setMessages, emitFn, {
                        sender: currentRole!,
                        content: text,
                        kind: 'user',
                        clientMessageId,
                        conversationId,
                        data: {
                            text,
                            avatar: currentRole === 'creator' ? AVATAR_CREATOR : AVATAR_MAKER,
                        },

                    });
                }}
                onUpload={async (files) => {
                    for (const file of files) {
                        const clientMessageId = generateId();
                        const previewUrl = URL.createObjectURL(file);

                        // 1) Optimistic message
                        const optimisticMsg: ImageMsg = {
                            id: generateId(),
                            clientMessageId,
                            kind: "image",
                            sender: "creator",
                            senderId: currentUserId, // or however you store it
                            time: new Date().toISOString(),
                            status: "uploading",
                            data: {
                                imageUrl: previewUrl,   // use previewUrl in place of image until upload succeeds
                                previewUrl,
                                caption: file.name,
                            },
                        };

                        setMessages(prev => [...prev, optimisticMsg]);

                        try {
                            // 2) Upload file
                            const formData = new FormData();
                            formData.append("image", file); // ✅ must match backend
                            const uploadRes = await fetch(
                                `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/upload-image`,
                                {
                                    method: "POST",
                                    headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token") ?? ""}` },
                                    body: formData,
                                }
                            );

                            if (!uploadRes.ok) {
                                const errText = await uploadRes.text();
                                throw new Error(`Upload failed: ${uploadRes.status} - ${errText}`);
                            }

                            const uploadJson = await uploadRes.json();
                            const imageUrl = uploadJson.data?.imageUrl;
                            if (!imageUrl) throw new Error("Upload response missing imageUrl");

                            // 3) Emit via socket
                            emitFn?.("sendMessage", {
                                conversationId,
                                content: imageUrl,
                                type: "image",
                                clientMessageId,
                                sender: "creator",
                            });

                            // 4) Update optimistic msg with final url
                            setMessages(prev =>
                                prev.map(m =>
                                    m.clientMessageId === clientMessageId
                                        ? {
                                            ...m,
                                            status: "uploaded",
                                            data: { ...m.data, imageUrl },
                                        }
                                        : m
                                )
                            );

                            // free preview blob
                            URL.revokeObjectURL(previewUrl);
                        } catch (err) {
                            console.error("❌ image upload failed (creator)", err);
                            setMessages(prev =>
                                prev.map(m =>
                                    m.clientMessageId === clientMessageId
                                        ? { ...m, status: "failed" }
                                        : m
                                )
                            );
                            URL.revokeObjectURL(previewUrl);
                        }
                    }
                }}

                onAction={handleAction}
                onTyping={(sender) => emitFn?.('typing', { conversationId, sender: currentRole, isTyping: true })}
                onStopTyping={(sender) => emitFn?.('typing', { conversationId, sender: currentRole, isTyping: false })}
            />

            {/*Once Attachments is fixed  */}
            {/* 
            <DeliveryMeasurementFormModal
    open={deliveryMeasurementOpen}
    onClose={() => setDeliveryMeasurementOpen(false)}
    onSubmit={values => {
        const clientMessageId = generateId();

        // Map modal values → backend shape
        const deliveryDetails = {
            country: values.country,
            fullName: values.fullName,
            phone: values.phone,
            address: values.address,
        };

        const measurements = {
            neck: parseMaybeNumber(values.neck),
            chest: parseMaybeNumber(values.chest),
            armLeft: parseMaybeNumber(values.armLeft),
            armRight: parseMaybeNumber(values.armRight),
            waist: parseMaybeNumber(values.waist),
            weight: parseMaybeNumber(values.weight),
            hips: parseMaybeNumber(values.hips),
            legs: parseMaybeNumber(values.legs),
            thighLeft: parseMaybeNumber(values.thighLeft),
            thighRight: parseMaybeNumber(values.thighRight),
            calfLeft: parseMaybeNumber(values.calfLeft),
            calfRight: parseMaybeNumber(values.calfRight),
        };

        // Merge delivery + measurements
        const payloadData = {
            ...deliveryDetails,
            ...measurements,
            shippingStatus: 'Pending',
            avatar: AVATAR_CREATOR,
        };

        // Save optimistic data for maker if backend strips attachments
        optimisticMessagesRef.current[clientMessageId] = payloadData;

        // Optimistic UI: show the DeliveryMeasurementCard immediately
        sendOptimisticMessage(setMessages, emitFn, {
            sender: 'creator',
            kind: 'deliveryMeasurement.card',
            clientMessageId,
            data: payloadData,
            conversationId,
        });

        setDeliveryMeasurementOpen(false);

        // Backend payload using attachments
        const socketPayload = {
            conversationId,
            content: 'Here are my delivery and measurement details', // text fallback
            type: 'delivery_and_measurements',
            sender: 'creator',
            clientMessageId,
            attachments: [
                {
                    type: 'delivery_measurement',
                    data: payloadData,
                },
            ],
        };

        if (emitFn) {
            emitFn('sendMessage', socketPayload);
        } else {
            (async () => {
                try {
                    const token = localStorage.getItem('jwt_token') ?? '';
                    const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;
                    await fetch(`${baseurl}/marketplace/chat/${conversationId}/message`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(socketPayload),
                    });
                } catch (err) {
                    console.error('HTTP fallback failed', err);
                    setMessages(prev =>
                        prev.map(m =>
                            m.clientMessageId === clientMessageId
                                ? { ...m, status: 'failed' }
                                : m
                        )
                    );
                }
            })();
        }
    }}
/> */}



            {/* Quick fix  */}
            <DeliveryMeasurementFormModal
                open={deliveryMeasurementOpen}
                onClose={() => setDeliveryMeasurementOpen(false)}
                onSubmit={values => {
                    const clientMessageId = generateId();

                    // Map modal values → backend shape
                    const deliveryDetails = {
                        country: values.country,
                        fullName: values.fullName,
                        phone: values.phone,
                        address: values.address,
                    };

                    const measurements = {
                        neck: parseMaybeNumber(values.neck),
                        chest: parseMaybeNumber(values.chest),
                        armLeft: parseMaybeNumber(values.armLeft),
                        armRight: parseMaybeNumber(values.armRight),
                        waist: parseMaybeNumber(values.waist),
                        weight: parseMaybeNumber(values.weight),
                        hips: parseMaybeNumber(values.hips),
                        legs: parseMaybeNumber(values.legs),
                        thighLeft: parseMaybeNumber(values.thighLeft),
                        thighRight: parseMaybeNumber(values.thighRight),
                        calfLeft: parseMaybeNumber(values.calfLeft),
                        calfRight: parseMaybeNumber(values.calfRight),
                    };

                    // Merge delivery + measurements
                    const payloadData = {
                        ...deliveryDetails,
                        ...measurements,
                        shippingStatus: 'Pending',
                        avatar: AVATAR_CREATOR,
                    };

                    // Save optimistic data for local rendering
                    optimisticMessagesRef.current[clientMessageId] = payloadData;

                    // Optimistic UI: show card immediately
                    sendOptimisticMessage(setMessages, emitFn, {
                        sender: 'creator',
                        kind: 'deliveryMeasurement.card',
                        clientMessageId,
                        data: payloadData,
                        conversationId,
                    });

                    setDeliveryMeasurementOpen(false);

                    // Quick fix: send JSON string in content
                    const socketPayload = {
                        conversationId,
                        content: JSON.stringify(payloadData), // ✅ all info goes here
                        type: 'delivery_and_measurements',
                        sender: 'creator',
                        clientMessageId,
                    };

                    if (emitFn) {
                        emitFn('sendMessage', socketPayload);
                    } else {
                        (async () => {
                            try {
                                const token = localStorage.getItem('jwt_token') ?? '';
                                const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;
                                await fetch(`${baseurl}/marketplace/chat/${conversationId}/message`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify(socketPayload),
                                });
                            } catch (err) {
                                console.error('HTTP fallback failed', err);
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.clientMessageId === clientMessageId
                                            ? { ...m, status: 'failed' }
                                            : m
                                    )
                                );
                            }
                        })();
                    }
                }}
            />
        </div>
    );
}
