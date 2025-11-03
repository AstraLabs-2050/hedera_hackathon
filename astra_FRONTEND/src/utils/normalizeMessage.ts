import { AVATAR_CREATOR, AVATAR_MAKER } from "./avatars";

// adjust this type to your actual ChatMessage interface
export type ChatMessage = {
    id: string;
    conversationId: string;
    sender: "maker" | "creator" | "system";
    senderId: string;
    kind: string;
    data: any;
    createdAt: string;
    avatar: string;
};

export function normalizeMessage(raw: any, currentUserId: string): ChatMessage {
    let kind = "user";
    let sender: "maker" | "creator" | "system" = "maker";
    let data: any = {};

    if (raw.type === "system") {
        kind = "system";
        sender = "system";
        data = { text: raw.content };
    } else if (raw.type === "delivery_and_measurements") {
        // 🔑 Convert to deliveryMeasurement.card
        kind = "deliveryMeasurement.card";
        sender = raw.sender === currentUserId ? "creator" : "maker";

        try {
            data =
                typeof raw.content === "string"
                    ? JSON.parse(raw.content)
                    : raw.content;
        } catch (e) {
            console.error(
                "Failed to parse delivery_and_measurements JSON:",
                raw.content
            );
            data = { text: raw.content }; // fallback
        }
    } else {
        // Normal user messages
        kind = "user";
        sender = raw.sender === currentUserId ? "creator" : "maker";
        data = { text: raw.content };
    }

    return {
        id: raw.id || raw._id || crypto.randomUUID(),
        conversationId: raw.conversationId,
        sender,
        senderId: raw.senderId || raw.sender,
        kind,
        data,
        createdAt: raw.createdAt || new Date().toISOString(),
        avatar: sender === "creator" ? AVATAR_CREATOR : AVATAR_MAKER,
    };
}
