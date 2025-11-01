import { ChatMessage, UserTextMsg } from "@/types/chat";
import { AVATAR_MAKER, AVATAR_CREATOR } from "@/utils/avatars";
import { normalizeSender } from "./normalizeSender";

function generateId() {
    return `local-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export async function fetchMessages(
    chatId: string,
    token: string,
    currentRole: "maker" | "creator",
    currentUserId: string | null
): Promise<ChatMessage[]> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL!}/marketplace/chat/${chatId}/messages`,
        { headers: { Authorization: `Bearer ${token} `}},
    );

    if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`❌ Failed to fetch messages [${res.status}]: ${errorData}`);
    }

    const data = await res.json();
    const rawMessages = data.data || [];

    // ✅ Grab makerId & creatorId from response if backend provides them
    const makerId: string | null = data.makerId ?? null;
    const creatorId: string | null = data.creatorId ?? null;

    const normalized: ChatMessage[] = rawMessages.map((raw: any) => {
        const isImage =
            typeof raw.content === "string" && raw.content.startsWith("http");

        // ✅ Use normalizeSender with full context
        const sender = normalizeSender(raw, {
            currentRole,
            currentUserId,
            makerId,
            creatorId,
        });

        // 🔎 Debug log
        console.log("📩 Message Debug", {
            rawSenderId: raw.senderId,
            rawUserType: raw.sender?.userType,
            normalizedSender: sender,
            currentRole,
            currentUserId,
            makerId,
            creatorId,
        });

        const id = raw.id ?? raw.clientMessageId ?? generateId();

        const message: UserTextMsg = {
            id,
            kind: raw.kind ?? "user",
            sender,
            senderId: raw.senderId ?? null,
            time: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
            status: "sent",
            data: {
                text: isImage ? "" : raw.content ?? "",
                imageUrl: isImage ? raw.content : undefined,
                avatar: sender === "creator" ? AVATAR_CREATOR : AVATAR_MAKER,
            },
            clientMessageId: raw.clientMessageId ?? undefined,
        };

        return message;
    });

    // ✅ Deduplicate by both id and clientMessageId
    const seen = new Set<string>();
    const uniqueMessages = normalized.filter((msg) => {
        const keys = [msg.id, msg.clientMessageId].filter(Boolean);
        const alreadySeen = keys.some((k) => seen.has(k!));
        if (alreadySeen) return false;
        keys.forEach((k) => seen.add(k!));
        return true;
    });

    // ✅ Sort by time
    uniqueMessages.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    return uniqueMessages;
}