'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ChatInput from './ChatInput';
import SystemAccepted from '../messages/SystemAccepted';
import PaymentMessage from '../messages/PaymentMessage';
// import ActionDeliveryMeasurementMessage from '../messages/ActionDeliveryMeasurementMessage';
import UserMessage from '../messages/UserMessage';
import DeliveryMeasurementCard from '../messages/DeliveryMeasurementCard';
import ActionPaymentMessage from '../messages/ActionPaymentMessage';
import { sendOptimisticMessage } from '@/utils/chat';
import { AVATAR_MAKER, AVATAR_CREATOR } from '@/utils/avatars';
import useChatSocket from '@/app/hooks/useChatSocket';
import { fetchMessages } from '../../../utils/fetchMessages';
import type { ChatMessage, UserTextMsg, DeliveryMeasurementCardMsg, PaymentMsg, ImageMsg, MessageKind, SystemAcceptedMsg } from '@/types/chat';
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
    // escrowBalance: number;
    // setEscrowBalance: React.Dispatch<React.SetStateAction<number>>;
};

export default function ChatWindow({ 
    conversationId,
    makerId, 
    creatorId, 
    // escrowBalance, 
    // setEscrowBalance 
}: Props) {
    // const [deliveryMeasurementOpen, setDeliveryMeasurementOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [sender: string]: boolean }>({});
    const [emitFn, setEmitFn] = useState<((event: string, data?: any) => void) | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const optimisticMessagesRef = useRef<{ [clientMessageId: string]: any }>({});
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') ?? "" : "";
    const containerRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
    const storedAmount = localStorage.getItem("latestMilestoneAmount");
    if (storedAmount) {
      const fakeMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 10),
        kind: "payment",
        sender: "system",
        senderId: "",
        time: new Date().toISOString(),
        status: "sent",
        data: { 
          amount: storedAmount,
          text: "Milestone payment released"
        }
      };

      setMessages((prev) => [...prev, fakeMessage]);

      // optional: clear so it doesn’t repeat next load
      localStorage.removeItem("latestMilestoneAmount");
    }
  }, []);

    // ---------- Mapper: backend type -> ChatMessage kind & sender ----------
    const mapTypeToKindAndSender = (raw: any): { kind: ChatMessage['kind']; 
        sender: 'maker' | 'creator' | 'system' } => {
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
            case 'applicationAccepted':
            case 'application_accepted':        
            case 'system.accepted':           
                return { kind: 'system.accepted', sender: 'system' };
            case "payment_approved":
                return { kind: "payment", sender: "system" };
            case 'system.accepted':
                return { kind: 'system.accepted', sender: 'system' };
            case 'payment':
                return { kind: 'payment', sender: 'system' };
            case 'escrow.release':
                return { kind: 'escrow.release', sender: 'creator' };
            case 'image':
                return { kind: 'image', sender: raw.senderId === makerId ? 'maker' : 'creator' };
            case 'user':
            default:
                return { kind: 'user', sender: raw.senderId === makerId ? 'maker' : 'creator' };
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        const end = messagesEndRef.current;

        if (!container || !end) return;

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (!conversationId || !token) return;

        const loadChat = async () => {
            try {
                // 1) Load normal chat messages
                const msgs = await fetchMessages(conversationId, token, "maker", currentUserId);

                // 2) Look for latest delivery card in chat history
                const latestDeliveryMsg = [...msgs]
                    .reverse()
                    .find((m) => m.kind === "deliveryMeasurement.card");

                let cardMsg: ChatMessage | null = latestDeliveryMsg ?? null;

                // 3) If not found, fallback to /delivery-measurements
                // if (!cardMsg) {
                //     const res = await fetch(
                //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${conversationId}/delivery-measurements`,
                //         { headers: { Authorization: `Bearer ${token}` } }
                //     );

                //     if (res.ok) {
                //         const json = await res.json();
                //         if (json?.data) {
                //             const dd = json.data?.deliveryDetails ?? {};
                //             const mm = json.data?.measurements ?? {};

                //             cardMsg = {
                //                 id: json.data.id ?? `delivery-${conversationId}`,
                //                 kind: "deliveryMeasurement.card",
                //                 sender: "creator", // creator fills the form
                //                 senderId: json.data.senderId ?? "",
                //                 time: json.data.createdAt ?? nowIso(),
                //                 status: "sent",
                //                 data: {
                //                     country: dd.country ?? "",
                //                     fullName: dd.fullName ?? dd.name ?? "",
                //                     phone: dd.phone ?? "",
                //                     address: dd.address ?? "",
                //                     shippingStatus: dd.shippingStatus ?? "Pending",
                //                     city: dd.city ?? "",
                //                     state: dd.state ?? "",
                //                     postalCode: dd.postalCode ?? "",
                //                     avatar: AVATAR_CREATOR,
                //                     ...dd,
                //                     ...mm,
                //                 },
                //             };
                //         }
                //     }
                // }

                // 4) Merge into messages
                const allMsgs = cardMsg ? [...msgs, cardMsg] : msgs;

                // 5) Sort by time
                allMsgs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

                setMessages(allMsgs);
            } catch (err) {
                console.error("Failed to load chat:", err);
            }
        };

        loadChat();
    }, [conversationId, currentUserId]);


    const mapTypeToKind = (raw: any): ChatMessage["kind"] => {
        const t = raw.type ?? raw.messageType ?? raw.kind;
        const action = raw.actionType ?? "";

        if (t === "delivery_and_measurements") return "deliveryMeasurement.card";
        if (["action.deliveryMeasurement", "request_delivery_measurements", "request_delivery_measurement"].includes(t))
            return "action.deliveryMeasurement";
        if (["action.payment", "payment_request"].includes(t)) return "action.payment";
        if (t === "payment" || action === "payment_approved" || raw.content?.toLowerCase()?.includes("milestone payment released"))
            return "payment"; // 🟢 catch milestone payment
        return (raw.kind as ChatMessage["kind"]) ?? "user";
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

// const onNewMessage = useCallback(
//     (raw: any) => {
//         const nowIso = () => new Date().toISOString(); // fallback timestamp
//         const generateId = () => crypto.randomUUID(); // fallback ID generator

//         // 1️⃣ Detect if the message is an image
//         const isImage = raw.type === "image" || raw.kind === "image";

//         // 2️⃣ Determine message kind
//         let kind: MessageKind;
//         if (isImage) {
//             kind = "image";
//         } else if (raw.type === "applicationAccepted" || raw.actionType === "application_accepted") {
//             kind = "system.accepted";
//         } else if (
//             (raw.type === "system" && raw.actionType === "payment_request") ||
//             raw.actionType === "payment_request"
//         ) {
//             kind = "action.payment";
//         } else if (
//             (raw.type === "system" && raw.actionType === "payment_approved") ||
//             raw.content?.toLowerCase()?.includes("milestone payment released")
//         ) {
//             kind = "payment";
//         // } else if (raw.type === "system" && raw.actionType === "application_accepted") {
//         //     kind = "system.accepted";
//         } 
//         else if (raw.type === "system" && raw.actionType === "escrow_release") {
//             kind = "escrow.release";
//         } else {
//             kind = (raw.kind as MessageKind) || "user";
//         }

//         // 3️⃣ Normalize the message
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
//         } else if (kind === "system.accepted") {
//             // ✅ Application accepted system message
//             normalized = {
//                 id: raw.id ?? raw.serverMessageId ?? generateId(),
//                 clientMessageId: raw.clientMessageId,
//                 kind: "system.accepted",
//                 sender: "system",
//                 senderId: raw.senderId,
//                 time: raw.createdAt ?? nowIso(),
//                 status: "sent",
//                 data: {
//                     text: raw.content ?? "Application accepted",
//                     applicationData: raw.applicationData, // optional: include job details
//                     avatar: undefined,
//                     ...raw.data,
//                 },
//             };
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
//                     ...raw.data,
//                 },
//             } as ChatMessage;
//         }

//         // 4️⃣ Merge into message list safely
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

// const onNewMessage = useCallback(
//   (raw: any) => {
//     const nowIso = () => new Date().toISOString();
//     const generateId = () =>
//       typeof crypto !== "undefined" && crypto.randomUUID
//         ? crypto.randomUUID()
//         : `id-${Date.now()}-${Math.random()}`;

//     // 🧩 1️⃣ Parse delivery_and_measurements content safely
//     let parsedData = raw.data;
//     if (
//       raw.type === "delivery_and_measurements" ||
//       raw.kind === "delivery_and_measurements"
//     ) {
//       if (typeof raw.content === "string") {
//         try {
//           parsedData = JSON.parse(raw.content);
//           console.log("✅ Parsed delivery measurements:", parsedData);
//         } catch (err) {
//           console.warn("⚠️ Failed to parse delivery_and_measurements content", err);
//         }
//       }
//     }

//     // 🧩 2️⃣ Determine message kind
//     let kind: MessageKind;
//     if (raw.type === "image" || raw.kind === "image") {
//       kind = "image";
//     } else if (
//       raw.type === "delivery_and_measurements" ||
//       raw.kind === "delivery_and_measurements"
//     ) {
//       kind = "deliveryMeasurement.card";
//     } else if (
//       raw.type === "applicationAccepted" ||
//       raw.actionType === "application_accepted"
//     ) {
//       kind = "system.accepted";
//     } else if (
//       (raw.type === "system" && raw.actionType === "payment_request") ||
//       raw.actionType === "payment_request"
//     ) {
//       kind = "action.payment";
//     } else if (
//       (raw.type === "system" && raw.actionType === "payment_approved") ||
//       raw.content?.toLowerCase()?.includes("milestone payment released")
//     ) {
//       kind = "payment";
//     } else if (raw.type === "system" && raw.actionType === "escrow_release") {
//       kind = "escrow.release";
//     } else {
//       kind = (raw.kind as MessageKind) || "user";
//     }

//     // 🧩 3️⃣ Normalize message
//     let normalized: ChatMessage;

//     if (kind === "deliveryMeasurement.card") {
//       normalized = {
//         id: raw.id ?? raw.serverMessageId ?? generateId(),
//         clientMessageId: raw.clientMessageId,
//         kind: "deliveryMeasurement.card",
//         sender: "creator", // delivery cards always come from creator
//         senderId: raw.senderId,
//         time: raw.createdAt ?? nowIso(),
//         status: "sent",
//         data: {
//           ...(parsedData || {}),
//           avatar: AVATAR_CREATOR,
//         },
//       };
//     } else if (kind === "image") {
//       normalized = {
//         id: raw.id ?? raw.serverMessageId ?? generateId(),
//         clientMessageId: raw.clientMessageId,
//         kind: "image",
//         sender:
//           raw.senderId === makerId
//             ? "maker"
//             : raw.senderId === creatorId
//             ? "creator"
//             : "system",
//         senderId: raw.senderId,
//         time: raw.createdAt ?? nowIso(),
//         status: "sent",
//         data: {
//           imageUrl: raw.content ?? "",
//           ...(raw.data || {}),
//         },
//       } as ImageMsg;
//     } else if (kind === "system.accepted") {
//       normalized = {
//         id: raw.id ?? raw.serverMessageId ?? generateId(),
//         clientMessageId: raw.clientMessageId,
//         kind: "system.accepted",
//         sender: "system",
//         senderId: raw.senderId,
//         time: raw.createdAt ?? nowIso(),
//         status: "sent",
//         data: {
//           text: raw.content ?? "Application accepted",
//           ...raw.data,
//         },
//       };
//     } else {
//       normalized = {
//         id: raw.id ?? raw.serverMessageId ?? generateId(),
//         clientMessageId: raw.clientMessageId,
//         kind,
//         sender:
//           raw.senderId === makerId
//             ? "maker"
//             : raw.senderId === creatorId
//             ? "creator"
//             : "system",
//         senderId: raw.senderId,
//         time: raw.createdAt ?? nowIso(),
//         status: "sent",
//         data: {
//           text: raw.content ?? "",
//           avatar:
//             raw.senderId === makerId
//               ? AVATAR_MAKER
//               : raw.senderId === creatorId
//               ? AVATAR_CREATOR
//               : undefined,
//           ...raw.data,
//         },
//       } as ChatMessage;
//     }

//     // 🧩 4️⃣ Merge into message list
//     setMessages((prev) => {
//       if (normalized.id && prev.some((m) => m.id === normalized.id)) return prev;

//       if (normalized.clientMessageId) {
//         const idx = prev.findIndex(
//           (m) => m.clientMessageId === normalized.clientMessageId
//         );
//         if (idx !== -1) {
//           const updated = [...prev];
//           updated[idx] = { ...updated[idx], ...normalized, status: "sent" };
//           return updated;
//         }
//       }

//       return [...prev, normalized].sort(
//         (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
//       );
//     });
//   },
//   [makerId, creatorId]
// );


const onNewMessage = useCallback(async (raw: any) => {
  try {
    console.log("📥 New message received:", raw);

    const serverId = raw.id ?? raw.serverMessageId;
    const clientMessageId = raw.clientMessageId ?? raw.clientId;
    const content = raw.content ?? raw.text ?? raw.message ?? "";
    const { kind, sender } = mapTypeToKindAndSender(raw);

    let normalized: ChatMessage;

    // 🟢 QUICK FIX: Force kind detection manually
    let detectedKind = kind;

    if (
      raw.type === "deliveryMeasurement.card" ||
      raw.actionType === "deliveryMeasurement.card" ||
      raw.data?.deliveryDetails ||
      raw.data?.measurements ||
      content?.toLowerCase()?.includes("delivery") ||
      content?.toLowerCase()?.includes("measurement")
    ) {
      detectedKind = "deliveryMeasurement.card";
    }

    // ✅ Delivery Measurement Card
    if (detectedKind === "deliveryMeasurement.card") {
      const fallbackData = clientMessageId
        ? optimisticMessagesRef.current[clientMessageId]
        : null;

      let parsedData: any = null;

      // 1️⃣ Prefer structured backend data
      if (raw.data && Object.keys(raw.data).length > 0) {
        parsedData = raw.data;
      } else if (raw.deliveryDetails || raw.measurements) {
        parsedData = { ...(raw.deliveryDetails || {}), ...(raw.measurements || {}) };
      } else if (content && typeof content === "string") {
        try {
          const maybeJson = JSON.parse(content);
          if (typeof maybeJson === "object") {
            parsedData = maybeJson;
          }
        } catch {
          parsedData = {
            note: content,
            shippingStatus: "Pending",
          };
        }
      }

      if (!parsedData && fallbackData) {
        parsedData = fallbackData;
      }

      parsedData = parsedData ?? {
        fullName: "—",
        address: "—",
        country: "—",
        phone: "—",
        shippingStatus: "Pending",
      };

      normalized = {
        id: serverId,
        kind: "deliveryMeasurement.card",
        sender: sender as "maker" | "creator",
        senderId: raw.senderId ?? "",
        time: raw.createdAt ?? nowIso(),
        status: "sent",
        data: {
          country: parsedData?.country ?? "",
          fullName: parsedData?.fullName ?? parsedData?.name ?? "",
          phone: parsedData?.phone ?? "",
          address: parsedData?.address ?? "",
          shippingStatus: parsedData?.shippingStatus ?? "Pending",
          city: parsedData?.city ?? "",
          state: parsedData?.state ?? "",
          postalCode: parsedData?.postalCode ?? "",
          avatar:
            parsedData?.avatar || (sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR),
          ...parsedData,
        },
        ...(clientMessageId ? { clientMessageId } : {}),
      };
    }

    // ✅ Application Accepted card
    else if (
      content?.toLowerCase()?.includes("application accepted") ||
      raw.actionType === "application_accepted"
    ) {
      normalized = {
        id: serverId,
        kind: "system.accepted",
        sender: "system",
        senderId: "system",
        time: raw.createdAt ?? nowIso(),
        status: "sent",
        data: {
          projectTitle: raw.applicationData?.title ?? raw.data?.projectTitle,
          description: raw.applicationData?.description ?? raw.data?.description,
          timeline: raw.applicationData?.timeline ?? raw.data?.timeline,
          amount: raw.applicationData?.amount ?? raw.data?.amount,
        },
        ...(clientMessageId ? { clientMessageId } : {}),
      };
    }

    // ✅ Fallback (normal message)
    else {
      const text = content;
      normalized = {
        id: serverId,
        kind: (mapTypeToKind(raw) as ChatMessage["kind"]) ?? "user",
        sender: sender as "maker" | "creator" | "system",
        senderId: raw.senderId ?? "",
        time: raw.createdAt ?? nowIso(),
        status: "sent",
        data: {
          text,
          imageUrl: raw.data?.imageUrl ?? undefined,
          ...raw.data,
          avatar:
            raw.data?.avatar || (sender === "maker" ? AVATAR_MAKER : AVATAR_CREATOR),
        },
        ...(clientMessageId ? { clientMessageId } : {}),
      } as ChatMessage;
    }

    // ✅ Update state
    setMessages((prev) => {
      if (serverId && prev.some((m) => m.id === serverId)) return prev;

      if (clientMessageId) {
        const idx = prev.findIndex((m) => m.clientMessageId === clientMessageId);
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
  } catch (err) {
    console.error("onNewMessage parse error", err, raw);
  }
}, [makerId, conversationId]);


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
        onError: (err) => console.error("⚠ Chat socket error", err),
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
            case 'payment': {
                const clientMessageId = generateId();

                // ✅ 1. Show message instantly on maker’s side
                sendOptimisticMessage(setMessages, null, {
                    sender: 'maker',
                    kind: 'action.payment',
                    clientMessageId,
                    data: { text: 'Kindly approve payment' },
                    conversationId,
                });

                // ✅ 2. Actually tell backend it’s a system payment request
                emitFn?.('sendMessage', {
                    conversationId,
                    type: 'system',                // required by backend
                    actionType: 'payment_request', // tells it it’s payment-related
                    content: 'Kindly approve payment',
                    sender: 'maker',
                    clientMessageId,
                });

                break;
            }

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
                    kind: "action.completed",
                    type: "text",
                    clientMessageId,
                    sender: 'maker',
                    data: {},
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
                        console.error("⚠ Error calling complete-job endpoint", err);
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
        <div className="flex flex-col h-full bg-white w-full overflow-x-hidden">
            <div ref={containerRef} className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.map((msg, index) => {
                    console.log("🧾 Incoming message:", msg);
                    const key = msg.id || msg.clientMessageId || `msg-${index}`;
                    switch (msg.kind) {
                        case 'system.accepted':
                            return <SystemAccepted key={key} msg={msg as SystemAcceptedMsg} align={'left'} />;
                        case 'payment':
                            return (
                                <PaymentMessage
                                    key={key}
                                    msg={msg as PaymentMsg}
                                    currentRole="maker"
                                    align={'left'}
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
                        case 'deliveryMeasurement.card':
                            return (
                                <DeliveryMeasurementCard
                                    key={key}
                                    msg={msg as DeliveryMeasurementCardMsg}
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
        </div>
    );
}
