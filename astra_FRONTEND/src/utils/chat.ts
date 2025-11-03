// src/utils/chat.ts
'use client';

import { AVATAR_MAKER, AVATAR_CREATOR } from "./avatars";
import { generateId } from "./helpers";
import type {
    ChatMessage,
    Sender,
    MessageKind,
} from "@/types/chat";

/**
 * SendOptions for optimistic message builder
 */
type SendOptions<S extends Sender = "creator"> = {
    sender?: S;
    conversationId?: string;
    content?: string;
    kind?: ChatMessage["kind"];
    data?: Record<string, any>;
    replaceId?: string;
    clientMessageId?: string;
};


/**
 * Emit an optimistic message into UI and emit to socket (if available).
 */
export const sendOptimisticMessage = async <S extends Sender = "creator">(
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    emit: ((event: string, payload: any) => void) | null,
    options: SendOptions<S>
) => {
    const {
        sender = "creator" as S,
        conversationId = "conv-local",
        content = "",
        kind = "user",
        data = {},
        replaceId,
    } = options;

    const clientMessageId = options.clientMessageId ?? generateId();
    const messageId = replaceId ?? clientMessageId;
    const createdAt = new Date().toISOString();

    const optimistic: ChatMessage = (() => {
        switch (kind) {
            case "user":
                return {
                    id: messageId,
                    clientMessageId,
                    kind,
                    sender,
                    time: createdAt,
                    status: "pending",
                    data: {
                        text: content,
                        avatar: sender === "creator" ? AVATAR_CREATOR : AVATAR_MAKER,
                        ...data,
                    },
                } as ChatMessage;

            case "system.accepted":
            case "payment":
                return {
                    id: messageId,
                    clientMessageId,
                    kind,
                    sender: "system",
                    time: createdAt,
                    status: "pending",
                    data,
                } as ChatMessage;

            case "escrow.release":
            case "escrow.payment":
            case "action.payment":
            case "action.deliveryMeasurement":
            case "action.completed":
            case "deliveryMeasurement.card":
                return {
                    id: messageId,
                    clientMessageId,
                    kind,
                    sender,
                    time: createdAt,
                    status: "pending",
                    data,
                } as ChatMessage;

            default:
                return {
                    id: messageId,
                    clientMessageId,
                    kind,
                    sender,
                    time: createdAt,
                    status: "pending",
                    data,
                } as ChatMessage;
        }
    })();

    // Add optimistic message (replace if needed)
    setMessages((prev) =>
        replaceId ? prev.map((m) => (m.id === replaceId ? optimistic : m)) : [...prev, optimistic]
    );

    if (!emit) return;

    try {
        // Map frontend kind → backend-safe type
        let safeType: string = "text";
        if (kind === "deliveryMeasurement.card") {
            safeType = "delivery_and_measurements";
        } else if (kind === "user") {
            safeType = "text";
        } else if (kind === "payment") {
            safeType = "payment";
        } else {
            // any UI-only kinds default to text
            safeType = "text";
        }

        // keep server protocol keys as your backend expects
        emit("message:send", {
            clientMessageId,
            conversationId,
            from: kind === "system.accepted" || kind === "payment" ? "system" : sender,
            to: sender === "maker" ? "creator" : "maker",
            content,
            type: safeType,   // ✅ backend-safe enum
            kind,             // frontend-only, for UI rendering
            data: optimistic.data,
        });
    } catch (err) {
        console.error("Message send failed", err);
        // mark optimistic message failed so UI shows retry affordance
        setMessages((prev) =>
            prev.map((m) => (m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m))
        );
    }
};

/**
 * Normalize a raw message from backend/socket into a ChatMessage (typed)
 */
export function normalizeMessage(
    raw: any,
    opts?: {
        makerId?: string;
        creatorId?: string;
        avatarMap?: { maker?: string; creator?: string };
        currentUserId?: string | null;
        currentRole?: "maker" | "creator" | null;
    }
): ChatMessage {
    const id: string = raw.id ?? raw.serverMessageId ?? raw.clientMessageId ?? `local-${Date.now()}`;
    const clientMessageId: string | undefined = raw.clientMessageId ?? raw.clientId;
    const time: string = raw.createdAt ?? new Date().toISOString();

    // Normalize backend "type" -> frontend kind
    let kind: MessageKind;
    if (raw.type === "delivery_and_measurements") {
        kind = "deliveryMeasurement.card";
    } else if (raw.kind) {
        kind = raw.kind as MessageKind;
    } else {
        kind = "user";
    }

    // Map senderId -> Sender (maker/creator/system)
    let sender: Sender;
    if (kind === "payment" || kind === "system.accepted") {
        sender = "system";
    } else {
        // Prefer explicit userType from backend if present
        const userType = raw.sender?.userType?.toLowerCase?.();
        if (userType === "maker" || userType === "creator") {
            sender = userType;
        } else if (opts?.makerId && raw.senderId && raw.senderId === opts.makerId) {
            sender = "maker";
        } else if (opts?.creatorId && raw.senderId && raw.senderId === opts.creatorId) {
            sender = "creator";
        } else if (raw.from === "maker" || raw.sender === "maker") {
            sender = "maker";
        } else if (raw.from === "creator" || raw.sender === "creator") {
            sender = "creator";
        } else if (opts?.currentUserId && opts?.currentRole && raw.senderId) {
            // Fallback: infer based on current user's id/role
            sender = raw.senderId === opts.currentUserId ? opts.currentRole : (opts.currentRole === "maker" ? "creator" : "maker");
        } else {
            sender = "creator"; // last resort
        }
    }

    const avatarFor = (s: Sender) =>
        s === "creator" ? opts?.avatarMap?.creator ?? AVATAR_CREATOR : opts?.avatarMap?.maker ?? AVATAR_MAKER;

    switch (kind) {
        case "deliveryMeasurement.card": {
            const delivery = raw.deliveryDetails ?? raw.data?.deliveryDetails ?? raw.data ?? {};
            const measurements = raw.measurements ?? raw.data?.measurements ?? raw.data ?? {};
            const format = (v: any) => (v === undefined || v === null ? undefined : String(v));

            const cardData = {
                country: delivery.country ?? delivery.countryName ?? "",
                fullName: delivery.name ?? delivery.fullName ?? delivery.full_name ?? "",
                phone: delivery.phone ?? "",
                address: delivery.address ?? "",
                shippingStatus: delivery.shippingStatus ?? raw.data?.shippingStatus ?? "Pending",
                neck: format(measurements.neck),
                chest: format(measurements.chest),
                armLeft: format(measurements.armLeft),
                armRight: format(measurements.armRight),
                waist: format(measurements.waist),
                hips: format(measurements.hips),
                legs: format(measurements.legs),
                thighLeft: format(measurements.thighLeft),
                thighRight: format(measurements.thighRight),
                calfLeft: format(measurements.calfLeft),
                calfRight: format(measurements.calfRight),
                avatar: raw.data?.avatar ?? avatarFor(sender),
                weight: format(measurements.weight),
            };

            return {
                id,
                clientMessageId,
                kind,
                sender,
                senderId: raw.senderId,
                time,
                status: "sent",
                data: cardData,
            };
        }

        case "user":
        default: {
            const content = raw.content ?? raw.text ?? "";
            const userData = { text: content, avatar: avatarFor(sender) };

            return {
                id,
                clientMessageId,
                kind: "user",
                sender: sender === "maker" ? "maker" : "creator", // ✅ only maker/creator allowed
                senderId: raw.senderId,
                time,
                status: "sent",
                data: userData,
            };
        }
    }
}
