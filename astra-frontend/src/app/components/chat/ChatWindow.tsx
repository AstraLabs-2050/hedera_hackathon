'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ChatInput from './ChatInput';
import SystemAccepted from '../messages/SystemAccepted';
import PaymentMessage from '../messages/PaymentMessage';
// import ActionCompleted from '../messages/ActionCompleted';
import ActionDeliveryMeasurementMessage from '../messages/ActionDeliveryMeasurementMessage';
import EscrowPayment from '../messages/EscrowPayment';
import UserMessage from '../messages/UserMessage';
import DeliveryMeasurementCard from '../messages/DeliveryMeasurementCard';
import EscrowRelease from '../messages/EscrowRelease';
import ActionPaymentMessage from '../messages/ActionPaymentMessage';
import { sendOptimisticMessage } from '@/utils/chat';
import { AVATAR_MAKER, AVATAR_CREATOR } from '@/utils/avatars';
import useChatSocket from '@/app/hooks/useChatSocket';
import DeliveryMeasurementFormModal, { DeliveryMeasurementFormValues } from '../../components/DeliveryMeasurementFormModal';
import { fetchMessages } from '../../../utils/fetchMessages';
import type { ChatMessage, UserTextMsg, DeliveryMeasurementCardMsg, PaymentMsg, ImageMsg } from '@/types/chat';
import { normalizeSender } from '../../../utils/normalizeSender'; // adjust path

// IDs helper
function generateId() {
    return typeof crypto !== 'undefined' && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `id-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}
const nowIso = () => new Date().toISOString();




type Props = {
    conversationId: string;
    makerId: string;
    creatorId: string;
    escrowBalance: number;
    setEscrowBalance: React.Dispatch<React.SetStateAction<number>>;
};

export default function ChatWindow({ conversationId, makerId, creatorId, escrowBalance, setEscrowBalance }: Props) {
    const [deliveryMeasurementOpen, setDeliveryMeasurementOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [sender: string]: boolean }>({});
    const [emitFn, setEmitFn] = useState<((event: string, data?: any) => void) | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const optimisticMessagesRef = useRef<{ [clientMessageId: string]: any }>({});
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') ?? "" : "";
    const containerRef = useRef<HTMLDivElement | null>(null);

    // ---------- Mapper: backend type -> ChatMessage kind & sender ----------
    const mapTypeToKindAndSender = (raw: any): { kind: ChatMessage['kind']; sender: 'maker' | 'creator' | 'system' } => {
        const t = raw.type ?? raw.messageType ?? raw.kind;

        switch (t) {
            case 'delivery_and_measurements':
                return { kind: 'deliveryMeasurement.card', sender: raw.senderId === makerId ? 'maker' : 'creator' };
            case 'action.deliveryMeasurement':
            case 'request_delivery_measurements':
            case 'request_delivery_measurement':
                return { kind: 'action.deliveryMeasurement', sender: raw.senderId === makerId ? 'maker' : 'creator' };
            case 'action.payment':
            case 'payment_request':
                return { kind: 'action.payment', sender: raw.senderId === makerId ? 'maker' : 'creator' };
            case 'payment':
                return { kind: 'payment', sender: 'system' };
            case 'system.accepted':
                return { kind: 'system.accepted', sender: 'system' };
            case 'escrow.payment':
                return { kind: 'escrow.payment', sender: 'creator' };
            case 'escrow.release':
                return { kind: 'escrow.release', sender: 'creator' };
            case 'image':
                return { kind: 'image', sender: raw.senderId === makerId ? 'maker' : 'creator' };
            case 'user':
            default:
                return { kind: 'user', sender: raw.senderId === makerId ? 'maker' : 'creator' };
        }
    };


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
        if (!conversationId || !token) return;

        fetchMessages(conversationId, token, "maker", currentUserId)
            .then((msgs) => setMessages(msgs))
            .catch((err) => console.error("Failed to load messages:", err));
    }, [conversationId, currentUserId]);

    // ---------- small mapper: backend type -> local kind ----------
    const mapTypeToKind = (raw: any): ChatMessage['kind'] => {
        // Backend-side message "type" values may vary; normalize them to your local kinds
        const t = raw.type ?? raw.messageType ?? raw.kind;

        if (t === 'delivery_and_measurements') return 'deliveryMeasurement.card';
        if (t === 'action.deliveryMeasurement' || t === 'request_delivery_measurements' || t === 'request_delivery_measurement') return 'action.deliveryMeasurement';
        if (t === 'action.payment' || t === 'payment_request') return 'action.payment';
        if (t === 'payment') return 'payment';
        // fallback to raw.kind if provided, otherwise 'user'
        return (raw.kind as ChatMessage['kind']) ?? 'user';
    };

    // ---------- SOCKET HANDLERS ----------
    const onMessageAck = useCallback((ack: any) => {
        setMessages((prev) =>
            prev.map((m: any) =>
                m.clientMessageId === ack.clientMessageId
                    ? { ...m, id: ack.serverMessageId ?? m.id, status: 'sent', time: ack.createdAt ?? m.time }
                    : m
            )
        );
    }, []);


    const onNewMessage = useCallback((raw: any) => {
        try {
            const serverId = raw.id ?? raw.serverMessageId;
            const clientMessageId = raw.clientMessageId ?? raw.clientId;
            const content = raw.content ?? raw.text ?? raw.message ?? "";
            const { kind, sender } = mapTypeToKindAndSender(raw);

            let normalized: ChatMessage;

            if (kind === 'image') {
                // raw.data.imageUrl or raw.content expected to be the image URL
                const imageUrl = raw.data?.imageUrl ?? content;
                // if server sends meta like width/height include them
                normalized = {
                    id: serverId,
                    kind: 'image',
                    sender: sender as 'maker' | 'creator' | 'system',
                    senderId: raw.senderId ?? "",
                    time: raw.createdAt ?? nowIso(),
                    status: 'sent',
                    data: {
                        imageUrl,
                        caption: raw.data?.caption ?? raw.caption ?? "",
                        width: raw.data?.width,
                        height: raw.data?.height,
                        ...raw.data,
                    },
                    ...(clientMessageId ? { clientMessageId } : {}),
                };
             } 
             else
                
                // If attachments is READY FROM BACKEND 
//                 if (kind === "deliveryMeasurement.card") {
//     const fallbackData = clientMessageId ? optimisticMessagesRef.current[clientMessageId] : null;

//     // Parse attachments first
//     let parsedData: any = null;
//     if (Array.isArray(raw.attachments) && raw.attachments.length > 0) {
//         const measurementAttachment = raw.attachments.find(att => att.type === 'delivery_measurement');
//         if (measurementAttachment) {
//             parsedData = measurementAttachment.data;
//         }
//     }

//     // Fallback to raw.data
//     if (!parsedData || Object.keys(parsedData).length === 0) {
//         parsedData = raw.data ?? {};
//     }

//     // Fallback to parsing raw.content JSON
//     if ((!parsedData || Object.keys(parsedData).length === 0) && raw.content) {
//         try {
//             parsedData = JSON.parse(raw.content);
//         } catch (err) {
//             console.warn("Failed to parse delivery measurement content JSON", err);
//             parsedData = {};
//         }
//     }

//     normalized = {
//         id: serverId,
//         kind,
//         sender: sender as 'maker' | 'creator',
//         senderId: raw.senderId ?? "",
//         time: raw.createdAt ?? nowIso(),
//         status: "sent",
//         data: {
//             country: parsedData?.country ?? fallbackData?.country ?? "",
//             fullName: parsedData?.fullName ?? parsedData?.name ?? fallbackData?.fullName ?? fallbackData?.name ?? "",
//             phone: parsedData?.phone ?? fallbackData?.phone ?? "",
//             address: parsedData?.address ?? fallbackData?.address ?? "",
//             shippingStatus: parsedData?.shippingStatus ?? fallbackData?.shippingStatus ?? "Pending",
//             city: parsedData?.city ?? fallbackData?.city ?? "",
//             state: parsedData?.state ?? fallbackData?.state ?? "",
//             postalCode: parsedData?.postalCode ?? fallbackData?.postalCode ?? "",
//             avatar: sender === "maker" ? AVATAR_CLIENT : AVATAR_CREATOR,
//             ...parsedData,
//         },
//         ...(clientMessageId ? { clientMessageId } : {}),
//     };
// }

                if (kind === "deliveryMeasurement.card") {
    const fallbackData = clientMessageId ? optimisticMessagesRef.current[clientMessageId] : null;

    // Parse content if data is empty
    let parsedData = raw.data;
    if ((!parsedData || Object.keys(parsedData).length === 0) && raw.content) {
        try {
            parsedData = JSON.parse(raw.content);
        } catch (err) {
            console.warn("Failed to parse delivery measurement content JSON", err);
            parsedData = {};
        }
    }

    normalized = {
        id: serverId,
        kind,
        sender: sender as 'maker' | 'creator',
        senderId: raw.senderId ?? "",
        time: raw.createdAt ?? nowIso(),
        status: "sent",
        data: {
            country: parsedData?.country ?? fallbackData?.country ?? "",
            fullName: parsedData?.fullName ?? parsedData?.name ?? fallbackData?.fullName ?? fallbackData?.name ?? "",
            phone: parsedData?.phone ?? fallbackData?.phone ?? "",
            address: parsedData?.address ?? fallbackData?.address ?? "",
            shippingStatus: parsedData?.shippingStatus ?? fallbackData?.shippingStatus ?? "Pending",
            city: parsedData?.city ?? fallbackData?.city ?? "",
            state: parsedData?.state ?? fallbackData?.state ?? "",
            postalCode: parsedData?.postalCode ?? fallbackData?.postalCode ?? "",
            avatar: parsedData?.avatar
                || (sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR),
            ...parsedData,
        },
        ...(clientMessageId ? { clientMessageId } : {}),
    };
}
 else {
                // fallback for text / other kinds
                const text = content;
                normalized = {
                    id: serverId,
                    kind: (mapTypeToKind(raw) as ChatMessage['kind']) ?? 'user',
                    sender: (sender as 'maker' | 'creator' | 'system'),
                    senderId: raw.senderId ?? "",
                    time: raw.createdAt ?? nowIso(),
                    status: 'sent',
                    data: {
                        text,
                        // if backend attaches image for text message
                        imageUrl: raw.data?.imageUrl ?? undefined,
                        ...raw.data,
                        avatar: raw.data?.avatar || (sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR),
                    },
                    ...(clientMessageId ? { clientMessageId } : {}),
                } as ChatMessage;
            }

            setMessages(prev => {
                // avoid duplicates from server
                if (serverId && prev.some(m => m.id === serverId)) return prev;

                // replace optimistic message if exists
                if (clientMessageId) {
                    const idx = prev.findIndex(m => m.clientMessageId === clientMessageId);
                    if (idx !== -1) {
                        const updated = [...prev];
                        // merge metadata but keep optimistic preview if needed
                        updated[idx] = { ...updated[idx], ...normalized, status: 'sent' };
                        // if the optimistic had a previewUrl and server supplied canonical imageUrl, update data
                        if (normalized.kind === 'image') {
                            updated[idx].data = { ...(updated[idx].data ?? {}), ...normalized.data };
                        }
                        return updated;
                    }
                }

                return [...prev, normalized].sort(
                    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
                );
            });
        } catch (err) {
            console.error("onNewMessage parse error", err, raw);
        }
    }, [makerId]);




    // ---------- SOCKET SETUP ----------
    const { emit } = useChatSocket({
        role: 'maker',
        token: typeof window !== "undefined" ? localStorage.getItem("jwt_token") ?? undefined : undefined,
        conversationId,
        onMessageAck,
        onNewMessage,
       onTyping: ({ sender }) => {
    setTypingUsers(prev => ({ ...prev, [sender]: true }));
    setTimeout(() => setTypingUsers(prev => ({ ...prev, [sender]: false })), 2000);
},
        onError: (err) => console.error("⚠️ Chat socket error", err),
    });
    useEffect(() => setEmitFn(() => emit), [emit]);

    // ---------- RETRY HANDLERS ----------
    const retryMessage = (msg: UserTextMsg) => {
        if (msg.status !== 'failed') return;

        sendOptimisticMessage(setMessages, emitFn, {
            sender: 'maker',
            content: msg.data.text,
            kind: 'user',
            conversationId,
        });

        setMessages(prev => prev.filter(m => m.id !== msg.id));
    };

    const retryDeliveryMeasurement = (msg: DeliveryMeasurementCardMsg) => {
        sendOptimisticMessage(setMessages, emitFn, {
            sender: 'maker',
            kind: 'deliveryMeasurement.card',
            data: msg.data,
            replaceId: msg.id,
            conversationId,
        });
    };

    // ---------- DELIVERY MEASUREMENT (maker cannot submit) ----------
    const openDeliveryMeasurement = () => setDeliveryMeasurementOpen(true);

    const handleDeliveryMeasurementSubmit = (values: DeliveryMeasurementFormValues) => {
        // maker should not be able to submit — keep UX consistent
        console.warn('Only creator may submit delivery & measurement details');
        setDeliveryMeasurementOpen(false);
    };

    // ---------- QUICK ACTIONS ----------
    const handleAction = (kind: 'measurement' | 'payment' | 'delivery' | 'completion' | 'deliveryMeasurement') => {
        switch (kind) {

            case 'deliveryMeasurement': {
                const clientMessageId = generateId();

                // 1) optimistic UI
                sendOptimisticMessage(setMessages, null, {
                    sender: 'maker',
                    kind: 'action.deliveryMeasurement',
                    clientMessageId,
                    data: {
                        text: 'Please provide your delivery & measurement details'
                    },
                    // conversationId,
                });

                // 2) tell the socket
                emitFn?.('quickAction', {
                    conversationId,
                    actionType: 'deliveryMeasurement',
                    sender: 'maker',
                    data: { text: 'Please provide your delivery & measurement details' },
                });
                break;
            }


            case 'payment':
                sendOptimisticMessage(setMessages, emitFn, {
                    sender: 'maker',
                    kind: 'action.payment',
                    data: { milestone: '' },
                    conversationId,
                });
                // you can also emit a socket message similarly if backend/other clients must see it
                emitFn?.('sendMessage', {
                    conversationId,
                    content: 'Please review payment request',
                    type: 'action.payment',
                    clientMessageId: generateId(),
                    sender: 'maker',
                });
                break;

            case "completion": {
                const clientMessageId = generateId();

                // 1) optimistic UI
                sendOptimisticMessage(setMessages, emitFn, {
                    sender: "system",
                    kind: "action.completed",
                    data: {},
                    clientMessageId,
                    conversationId,
                });

                // 2) emit socket so the other side sees it immediately
              emitFn?.("sendMessage", {
                            conversationId,
                            kind: "action.completed", // marker for frontend
                            type: "text",             // backend fallback
                            clientMessageId,
                            sender: 'maker',             // "maker" or "creator"
                            data: {},                 // optional extra
                        });

                // 3) POST to backend (official record)
                (async () => {
                    try {
                        const token = localStorage.getItem("jwt_token");
                        if (!token) throw new Error("No token found");

                        const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${conversationId}/complete-job`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (!res.ok) {
                            console.error("❌ Failed to mark job completed:", await res.text());
                            // optionally mark the optimistic message as failed
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m
                                )
                            );
                        } else {
                            console.log("✅ Job marked completed");
                        }
                    } catch (err) {
                        console.error("⚠️ Error calling complete-job endpoint", err);
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m
                            )
                        );
                    }
                })();

                break;
            }

        }
    };

    // ---------- Render ----------
    return (
        <div className="flex flex-col h-full bg-white w-full">
            <div ref={containerRef} className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.map((msg, index) => {
                    const key = msg.id || msg.clientMessageId || `msg-${index}`;
                    switch (msg.kind) {
                        case 'system.accepted':
                            return <SystemAccepted key={key} msg={msg} />;
                        case 'payment':
                            return <PaymentMessage key={key} msg={msg} />;
                        case 'escrow.payment':
                            return <EscrowPayment key={key} msg={msg} />;
                        case 'escrow.release':
                            return (
                                <EscrowRelease
                                    key={key}
                                    msg={msg}
                                    onRelease={(amount) => {
                                        const paymentMsg: PaymentMsg = {
                                            id: generateId(),
                                            kind: 'payment',
                                            sender: 'system',
                                            senderId: 'system',
                                            time: nowIso(),
                                            data: { payerName: 'Paulina', amount },
                                        };
                                        setMessages(prev => [...prev, paymentMsg]);
                                        setEscrowBalance(prev => prev - parseFloat(amount.replace('$', '')));
                                    }}
                                />
                            );
                        case 'action.payment':
                            return (
                                <ActionPaymentMessage
                                    key={key}
                                    msg={msg}
                                    avatarUrl={msg.data.avatar}
                                    // avatarUrl={msg.data.avatar || (msg.sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR)}
                                    // avatarUrl={AVATAR_CREATOR}
                                    onApprove={() => console.log("⚡ Dummy approve")}
                                />
                            );
                        case 'action.deliveryMeasurement':
                            return (
                                <ActionDeliveryMeasurementMessage
                                    key={key}
                                    msg={msg}
                                    onOpenForm={() => setDeliveryMeasurementOpen(true)}
                                    // avatarUrl={AVATAR_CREATOR}
                                    avatarUrl={msg.data.avatar}

                                    // avatarUrl={msg.data.avatar || (msg.sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR)}
                                    viewerRole='maker'
                                />
                            );
                        // case 'action.completed':
                        //     return <ActionCompleted
                        //         key={key}
                        //         msg={msg}
                        //         avatarUrl={AVATAR_CREATOR} />;
                        case 'deliveryMeasurement.card':
                            return (
                                <DeliveryMeasurementCard
                                    key={key}
                                    msg={msg}
                                    onRetry={() => retryDeliveryMeasurement(msg as DeliveryMeasurementCardMsg)}
                                />
                            );
                        case 'user':
                        default:
                            return (
                                <UserMessage
                                    key={key}
                                    msg={msg as UserTextMsg}
                                    currentRole="maker"
                                    onRetry={() => retryMessage(msg as UserTextMsg)}
                                />
                            );
                    }
                })}
                {/* {Object.entries(typingUsers).map(([sender, isTyping]) =>
    isTyping && (
        <div key={sender}>
            {sender === 'maker' ? 'Maker' : 'Creator'} is typing...
        </div>
    )
)} */}

                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                avatarCreator={AVATAR_CREATOR}
                avatarMaker={AVATAR_MAKER}
                onSend={(text) => {
                    if (!text.trim()) return;
                    const clientMessageId = generateId();
                    sendOptimisticMessage(setMessages, emitFn, {
                        sender: 'maker',
                        content: text,
                        kind: 'user',
                        clientMessageId,
                        conversationId,
                        data: {
                            text,
                            avatar: AVATAR_MAKER
                        }
                    });
                }}
                onUpload={async (files) => {
                    const token = localStorage.getItem("jwt_token");
                    if (!token) return;

                    for (const file of files) {
                        const clientMessageId = generateId();
                        const previewUrl = URL.createObjectURL(file);

                        // 1) Optimistic UI (temporary preview + uploading status)
                        const optimisticMsg: ImageMsg = {
                            id: generateId(), // local temporary id
                            clientMessageId,
                            kind: 'image',
                            sender: 'maker',
                            senderId: currentUserId,
                            time: nowIso(),
                            status: 'uploading',
                            data: {
                                imageUrl: previewUrl,   // ✅ required for type
                                previewUrl,             // ✅ optional, used for local preview
                                caption: file.name,
                                avatar: AVATAR_MAKER,
                            },
                        };
                        // keep a ref so server responses can fall back on it
                        optimisticMessagesRef.current[clientMessageId] = optimisticMsg.data;

                        setMessages(prev => [...prev, optimisticMsg]);

                        try {
                            // 2) Upload file
                            const formData = new FormData();
                            formData.append("image", file);
                            const uploadRes = await fetch(
                                `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/upload-image`,
                                {
                                    method: "POST",
                                    headers: { Authorization: `Bearer ${token}` },
                                    body: formData,
                                }
                            );

                            if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

                            const uploadJson = await uploadRes.json();
                            console.log("📦 Upload response:", uploadJson);

                            const imageUrl =
                                uploadJson.data?.imageUrl ??
                                uploadJson.url ??
                                uploadJson.path ??
                                uploadJson.image;

                            if (!imageUrl) throw new Error("Upload response missing url");


                            // 3) Send final message through socket (backend will broadcast)
                            emitFn?.("sendMessage", {
                                conversationId,
                                content: imageUrl,
                                type: "image",
                                clientMessageId,
                                sender: "maker",
                            });

                            // 4) locally update optimistic message to 'uploaded' with canonical url (optional)
                            setMessages(prev => prev.map(m => {
                                if (m.clientMessageId === clientMessageId) {
                                    return {
                                        ...m,
                                        status: 'uploaded',
                                        data: { ...(m.data || {}), imageUrl },
                                    };
                                }
                                return m;
                            }));

                            // revoke local preview (we can keep it for a small time but freeing memory is good)
                            URL.revokeObjectURL(previewUrl);
                            delete optimisticMessagesRef.current[clientMessageId];
                        } catch (err) {
                            console.error("❌ image upload failed", err);

                            // mark message as failed
                            setMessages(prev => prev.map(m => {
                                if (m.clientMessageId === clientMessageId) {
                                    return { ...m, status: 'failed' };
                                }
                                return m;
                            }));

                            // revoke preview
                            URL.revokeObjectURL(previewUrl);
                            delete optimisticMessagesRef.current[clientMessageId];
                        }
                    }
                }}

                onAction={handleAction}
                onTyping={() => emitFn?.('typing', { conversationId, sender: 'maker', isTyping: true })}
                onStopTyping={() => emitFn?.('typing', { conversationId, sender: 'maker', isTyping: false })}
            />


            {/* maker UI shouldn't submit details; keep modal client-side if you want to demo, but it should do nothing */}
            <DeliveryMeasurementFormModal
                open={deliveryMeasurementOpen}
                onClose={() => setDeliveryMeasurementOpen(false)}
                onSubmit={(values) => {
                    // maker submit should be blocked
                    console.warn('Only creator may submit delivery & measurement details');
                    setDeliveryMeasurementOpen(false);
                }}
            />
        </div>
    );
}