'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ChatpayInput from './ChatpayInput';
import DeliveryMeasurementFormModal from '../../components/DeliveryMeasurementFormModal';
import { sendOptimisticMessage, normalizeMessage } from '@/utils/chat';
import { AVATAR_MAKER, AVATAR_CREATOR } from '@/utils/avatars';
// import { useSearchParams } from 'next/navigation';
import { fetchMessages } from '../../../utils/fetchMessages';
import type { ChatMessage, UserTextMsg, ImageMsg, Sender, MessageKind, ActionPaymentMsg, PaymentMsg } from '@/types/chat';
import useChatSocket from '@/app/hooks/useChatSocket';
import SystemAccepted from '../messages/SystemAccepted';
import PaymentMessage from '../messages/PaymentMessage';
import ActionCompleted from '../messages/ActionCompleted';
import ActionDeliveryMeasurementMessage from '../messages/ActionDeliveryMeasurementMessage';
import UserMessage from '../messages/UserMessage';
import DeliveryMeasurementCard from '../messages/DeliveryMeasurementCard';
// import EscrowRelease from '../messages/EscrowRelease';
import ActionPaymentMessage from '../messages/ActionPaymentMessage';
import CreateEscrowModal from '../CreateEscrowModal';
import router from 'next/router';
import DesignAccepted from '../messages/DesignAccepted';

function generateId() {
    return typeof crypto !== 'undefined' && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `id-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

const nowIso = () => new Date().toISOString();

type Props = {
    conversationId: string;
    // escrowBalance: number;
    // setEscrowBalance: React.Dispatch<React.SetStateAction<number>>;
    makerId: string;
    creatorId: string;
};

export default function ChatpayWindow({ conversationId,
    // escrowBalance, 
    // setEscrowBalance, 
    makerId,
    creatorId
}: Props) {
    const [deliveryMeasurementOpen, setDeliveryMeasurementOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [sender: string]: boolean }>({});
    const [emitFn, setEmitFn] = useState<((event: string, data?: any) => void) | null>(null);
    // Keep track of optimistic messages by clientMessageId
    const optimisticMessagesRef = useRef<{ [clientMessageId: string]: any }>({});
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [showEscrowModal, setShowEscrowModal] = useState(false);
    const [escrowDetail, setEscrowDetail] = useState({
        remainingBalance: 0,
        totalAmount: 0,
    });

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("user_id") : null;
    const currentRole = typeof window !== "undefined"
        ? (localStorage.getItem("role") as "maker" | "creator")
        : null;

    useEffect(() => {
        const container = containerRef.current;
        const end = messagesEndRef.current;

        if (!container || !end) return;

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }, [messages]);

    //     useEffect(() => {
    //     const initialMsg = (router as any).state?.initialMessage;
    //     if (initialMsg) {
    //         setMessages([initialMsg]);
    //     }
    // }, []);


    // useEffect(() => {
    //     let initialMsg: ChatMessage | null = null;
    //     const msgStr = localStorage.getItem('initialDesignAcceptedMsg');

    //     if (msgStr) {
    //         try {
    //             initialMsg = JSON.parse(msgStr);
    //         } catch (err) {
    //             console.error("Invalid initialDesignAcceptedMsg JSON", err);
    //         }
    //     }

    //     const token = localStorage.getItem("jwt_token");
    //     if (!conversationId || !token || !currentUserId) return;

    //     const loadChat = async () => {
    //         try {
    //             const msgs = await fetchMessages(conversationId, token, currentRole, currentUserId);
    //             let allMsgs = msgs;

    //             if (initialMsg) {
    //                 const exists = msgs.some(
    //                     (m) => m.id === initialMsg.id || m.clientMessageId === initialMsg.clientMessageId
    //                 );
    //                 if (!exists) {
    //                     allMsgs = [initialMsg, ...msgs];
    //                 }
    //             }

    //             allMsgs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    //             setMessages(allMsgs);

    //             if (initialMsg) {
    //                 setTimeout(() => localStorage.removeItem('initialDesignAcceptedMsg'), 3000);
    //             }
    //         } catch (err) {
    //             console.error("Failed to load chat:", err);
    //             if (initialMsg) setMessages([initialMsg]);
    //         }
    //     };

    //     loadChat();
    // }, [conversationId, currentUserId, currentRole]);


    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (!conversationId || !token || !currentUserId) return;

        const loadChat = async () => {
            try {
                // 1) Load normal messages
                const msgs = await fetchMessages(conversationId, token, currentRole, currentUserId);

                // 2) Try to find latest delivery measurement message in history
                const latestDeliveryMsg = [...msgs]
                    .reverse()
                    .find((m) => m.kind === "deliveryMeasurement.card");

                let cardMsg: ChatMessage | null = latestDeliveryMsg ?? null;

                const allMsgs = cardMsg ? [...msgs, cardMsg] : msgs;

                // 5) Sort by time
                allMsgs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

                setMessages(allMsgs);
            } catch (err) {
                console.error("Failed to load chat:", err);
            }
        };

        loadChat();
    }, [conversationId, currentUserId, currentRole]);

        useEffect(() => {
      const msgStr = localStorage.getItem('initialDesignAcceptedMsg');
      let initialMsg: ChatMessage | null = null;

      if (msgStr) {
        initialMsg = JSON.parse(msgStr);
        localStorage.removeItem('initialDesignAcceptedMsg');
      }

      const token = localStorage.getItem("jwt_token");
      if (!conversationId || !token || !currentUserId) return;

      const loadChat = async () => {
        try {
          const msgs = await fetchMessages(conversationId, token, currentRole, currentUserId);

          // Merge initial message safely
          let allMsgs = msgs;
          if (initialMsg) {
            const exists = msgs.some(m => m.id === initialMsg!.id || m.clientMessageId === initialMsg!.clientMessageId);
            if (!exists) {
              allMsgs = [initialMsg, ...msgs];
            }
          }

          allMsgs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
          setMessages(allMsgs);
        } catch (err) {
          console.error("Failed to load chat:", err);
          // still show initial message
          if (initialMsg) setMessages([initialMsg]);
        }
      };

      loadChat();
    }, [conversationId, currentUserId, currentRole]);


    const onMessageAck = useCallback((ack: any) => {
        setMessages(prev =>
            prev.map(m =>
                m.clientMessageId === ack.clientMessageId
                    ? { ...m, id: ack.serverMessageId ?? m.id, status: 'sent', time: ack.createdAt ?? m.time }
                    : m
            )
        );
    }, []);

    const onNewMessage = useCallback(

        (raw: any) => {
            const isImage = raw.type === "image" || raw.kind === "image";

            // console.log("📥 New message received:", raw);
            // ⿡ Determine message kind
            let kind: MessageKind;

            // if (isImage) {
            //     kind = "image";
            // } else if (
            //     (raw.type === "system" && raw.actionType === "payment_request") ||
            //     raw.actionType === "payment_request"
            // ) {
            //     kind = "action.payment";
            // } else if (
            //     (raw.type === "system" && raw.actionType === "payment_approved") || raw.content?.toLowerCase()?.includes("milestone payment released")
            // ) {
            //     kind = "payment";
            // } else if (raw.type === "system" && raw.actionType === "job_accept") {
            //     kind = "system.accepted";
            // } else if (raw.type === "system" && raw.actionType === "escrow_release") {
            //     kind = "escrow.release";
            // } else {
            //     kind = (raw.kind as MessageKind) || "user";
            // }

            if (isImage) {
                kind = "image";
            } else if (
                (raw.type === "system" && raw.actionType === "payment_request") ||
                raw.actionType === "payment_request"
            ) {
                kind = "action.payment";
            } else if (
                (raw.type === "system" && raw.actionType === "payment_approved") ||
                raw.content?.toLowerCase()?.includes("milestone payment released")
            ) {
                kind = "payment";
            } else if (
                raw.type === "system" && raw.actionType === "job_accept"
            ) {
                kind = "system.accepted";
            } else if (
                raw.type === "design_inquiry" // 👈 NEW: recognize design accepted messages
            ) {
                kind = "system.accepted";
            } else if (raw.type === "system" && raw.actionType === "escrow_release") {
                kind = "escrow.release";
            } else {
                kind = (raw.kind as MessageKind) || "user";
            }


            // ⿢ Construct normalized message safely
            let normalized: ChatMessage;

            if (kind === "image") {
                // 🖼 Image message
                normalized = {
                    id: raw.id ?? raw.serverMessageId ?? generateId(),
                    clientMessageId: raw.clientMessageId,
                    kind: "image",
                    sender:
                        raw.senderId === makerId ? "maker"
                            : raw.senderId === creatorId
                                ? "creator"
                                : "system",
                    senderId: raw.senderId,
                    time: raw.createdAt ?? nowIso(),
                    status: "sent",
                    data: {
                        imageUrl: raw.content ?? "",
                        ...(raw.data || {}),
                    },
                } as ImageMsg;
            } else {
                // 🗨 Generic or system message (payment, action, etc.)
                normalized = {
                    id: raw.id ?? raw.serverMessageId ?? generateId(),
                    clientMessageId: raw.clientMessageId,
                    kind,
                    sender:
                        raw.senderId === makerId
                            ? "maker"
                            : raw.senderId === creatorId
                                ? "creator"
                                : "system",
                    senderId: raw.senderId,
                    time: raw.createdAt ?? nowIso(),
                    status: "sent",
                    data: {
                        text: raw.content ?? "",
                        avatar:
                            raw.senderId === makerId
                                ? AVATAR_MAKER
                                : raw.senderId === creatorId
                                    ? AVATAR_CREATOR
                                    : undefined,
                        ...raw.data,
                    },
                } as ChatMessage;
            }

            // ⿣ Merge into message list
            setMessages((prev) => {
                if (normalized.id && prev.some((m) => m.id === normalized.id)) return prev;

                if (normalized.clientMessageId) {
                    const idx = prev.findIndex(
                        (m) => m.clientMessageId === normalized.clientMessageId
                    );
                    if (idx !== -1) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], ...normalized, status: "sent" };
                        return updated;
                    }
                }

                return [...prev, normalized].sort(
                    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
                );
            });
        },
        [makerId, creatorId]
    );





    //     const onNewMessage = useCallback(
    //     (raw: any) => {
    //           console.log("📥 New message received:", raw);
    //         const isImage = raw.type === "image" || raw.kind === "image";

    //         // console.log("📥 New message received:", raw);
    //         // 1️⃣ Determine message kind
    //         let kind: MessageKind;

    //         if (isImage) {
    //             kind = "image";
    //         } else if (
    //             (raw.type === "system" && raw.actionType === "payment_request") ||
    //             raw.actionType === "payment_request"
    //         ) {
    //             kind = "action.payment";
    //         } else if (
    //             (raw.type === "system" && raw.actionType === "payment_approved") || raw.content?.toLowerCase()?.includes("milestone payment released")
    //         ) {
    //             kind = "payment";
    //             } 
    //             // else if (raw.type === "system" && raw.actionType === "job_accept") {
    //             //     kind = "system.accepted";
    //         // } else if (
    //         //     raw.type === "applicationAccepted" ||
    //         //     raw.actionType === "application_accepted" ||
    //         //     (raw.type === "system" && raw.actionType === "job_accept")
    //         // ) {
    //         //     kind = "system.accepted";
    //         // }
    //         else if (
    //     raw.content?.toLowerCase().includes("application accepted") ||
    //     raw.data?.text?.toLowerCase().includes("application accepted")
    // ) {
    //     kind = "system.accepted";
    // } 

    //         else if (raw.type === "system" && raw.actionType === "escrow_release") {
    //             kind = "escrow.release";
    //         } else {
    //             kind = (raw.kind as MessageKind) || "user";
    //         }

    //         // 2️⃣ Construct normalized message safely
    //         let normalized: ChatMessage;

    //         if (kind === "image") {
    //             // 🖼️ Image message
    //             normalized = {
    //                 id: raw.id ?? raw.serverMessageId ?? generateId(),
    //                 clientMessageId: raw.clientMessageId,
    //                 kind: "image",
    //                 sender:
    //                     raw.senderId === makerId
    //                         ? "maker"
    //                         : raw.senderId === creatorId
    //                             ? "creator"
    //                             : "system",
    //                 senderId: raw.senderId,
    //                 time: raw.createdAt ?? nowIso(),
    //                 status: "sent",
    //                 data: {
    //                     imageUrl: raw.content ?? "",
    //                     ...(raw.data || {}),
    //                 },
    //             } as ImageMsg;
    //         } else {
    //             // 🗨️ Generic or system message (payment, action, etc.)
    //             normalized = {
    //                 id: raw.id ?? raw.serverMessageId ?? generateId(),
    //                 clientMessageId: raw.clientMessageId,
    //                 kind,
    //                 sender:
    //                     raw.senderId === makerId
    //                         ? "maker"
    //                         : raw.senderId === creatorId
    //                             ? "creator"
    //                             : "system",
    //                 senderId: raw.senderId,
    //                 time: raw.createdAt ?? nowIso(),
    //                 status: "sent",
    //                 data: {
    //                     text: raw.content ?? "",
    //                     avatar:
    //                         raw.senderId === makerId
    //                             ? AVATAR_MAKER
    //                             : raw.senderId === creatorId
    //                                 ? AVATAR_CREATOR
    //                                 : undefined,
    //                     applicationData: raw.applicationData ?? undefined,
    //                     ...raw.data,

    //                     // 🟢 Flatten applicationData fields (added safely)
    //                     ...(raw.applicationData
    //                         ? {
    //                             projectTitle: raw.applicationData.title,
    //                             description: raw.applicationData.description,
    //                             timeline: raw.applicationData.timeline,
    //                             amount: raw.applicationData.amount,
    //                         }
    //                         : {}),
    //                 },
    //             } as ChatMessage;
    //         }

    //         // 3️⃣ Merge into message list
    //         setMessages((prev) => {
    //             if (normalized.id && prev.some((m) => m.id === normalized.id)) return prev;

    //             if (normalized.clientMessageId) {
    //                 const idx = prev.findIndex(
    //                     (m) => m.clientMessageId === normalized.clientMessageId
    //                 );
    //                 if (idx !== -1) {
    //                     const updated = [...prev];
    //                     updated[idx] = { ...updated[idx], ...normalized, status: "sent" };
    //                     return updated;
    //                 }
    //             }

    //             return [...prev, normalized].sort(
    //                 (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    //             );
    //         });
    //     },
    //     [makerId, creatorId]
    // );

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
        onError: err => console.error('⚠ Chat socket error', err),
    });

    useEffect(() => setEmitFn(() => emit), [emit]);

    // Actions
    const handleAction = (kind: 'deliveryMeasurement' | 'completion' | 'payment') => {
        if (kind === 'payment') {
            setShowEscrowModal(true);
        }
        if (kind === 'deliveryMeasurement') {
            setDeliveryMeasurementOpen(true);
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

    const parseMaybeNumber = (v?: string) => {
        if (v === undefined || v === null || v === '') return undefined;
        const n = Number(String(v).trim());
        return Number.isFinite(n) ? n : undefined;
    };

    // Render
    return (
        <div className="flex flex-col h-full bg-white w-full overflow-x-hidden">
            <div ref={containerRef} className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.map((msg, index) => {
                    console.log("🧾 Incoming message:", msg);
                    const key = msg.id || msg.clientMessageId || `msg-${index}`;
                    switch (msg.kind) {
                        case 'system.accepted':
                            return <SystemAccepted
                                key={key}
                                msg={msg}
                            />;
                        // case 'system.accepted':
                        //     return <DesignAccepted
                        //         key={key}
                        //         msg={msg}
                        //     />;
                        case 'payment':
                            return <PaymentMessage
                                key={key}
                                msg={msg as PaymentMsg}
                                align={'right'}
                            />;
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

            <CreateEscrowModal
                open={showEscrowModal}
                onOpenChange={setShowEscrowModal}
                chatId={conversationId}
                trigger={''}
                token={''}
                onCreateEscrow={function (data:
                    { makerWallet: string; treasuryAddress: string; creatorAddress: string; amount: string; }): void {
                    throw new Error('Function not implemented.');
                }}
                defaultView="manage"
            />


            <DeliveryMeasurementFormModal
                open={deliveryMeasurementOpen}
                onClose={() => setDeliveryMeasurementOpen(false)}
                onSubmit={values => {
                    const clientMessageId = generateId();

                    // 🟢 Prepare delivery + measurements
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

                    const payloadData = {
                        ...deliveryDetails,
                        ...measurements,
                        shippingStatus: "Pending",
                        avatar: AVATAR_CREATOR,
                    };

                    // 🟢 Optimistic update
                    // optimisticMessagesRef.current[clientMessageId] = payloadData;

                    sendOptimisticMessage(setMessages, emitFn, {
                        sender: "creator",
                        kind: "deliveryMeasurement.card",
                        clientMessageId,
                        data: payloadData,
                        conversationId,
                    });

                    setDeliveryMeasurementOpen(false);
                    // 🟢 Send as JSON in content (for maker to parse)
                    emitFn?.('sendMessage', {
                        conversationId,
                        content: JSON.stringify(payloadData),
                        type: 'delivery_and_measurements',
                        sender: 'creator',
                        clientMessageId,
                    });
                }}
            //     const socketPayload = {
            //         conversationId,
            //         content: JSON.stringify(payloadData), // JSON string
            //         type: "delivery_and_measurements",
            //         sender: "creator",
            //         clientMessageId,
            //     };

            //     if (emitFn) {
            //         emitFn("sendMessage", socketPayload);
            //     } else {
            //         (async () => {
            //             try {
            //                 const token = localStorage.getItem("jwt_token") ?? "";
            //                 const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;
            //                 await fetch(`${baseurl}/marketplace/chat/${conversationId}/message`, {
            //                     method: "POST",
            //                     headers: {
            //                         "Content-Type": "application/json",
            //                         Authorization: `Bearer ${token}`,
            //                     },
            //                     body: JSON.stringify(socketPayload),
            //                 });
            //             } catch (err) {
            //                 console.error("HTTP fallback failed", err);
            //                 setMessages(prev =>
            //                     prev.map(m =>
            //                         m.clientMessageId === clientMessageId
            //                             ? { ...m, status: "failed" }
            //                             : m
            //                     )
            //                 );
            //             }
            //         })();
            //     }
            // }}
            />
        </div>
    );
}

