// src/utils/sendMessage.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

type SendMessageParams = {
    chatId: string;
    token: string;
    content: string; // backend expects this
    type: "text" | "image" | "system"; // or whatever enums backend supports
};

export async function sendMessage({ chatId, token, content, type }: SendMessageParams) {
    try {
        const res = await fetch(`${BASE_URL}/marketplace/chat/${chatId}/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content, type }),
        });

        if (!res.ok) {
            const errorData = await res.text();
            throw new Error(`❌ Failed to send message [${res.status}]: ${errorData}`);
        }

        return res.json(); // expected: { status, message, data: { ...message } }
    } catch (err) {
        console.error("Error sending message:", err);
        throw err;
    }
}
