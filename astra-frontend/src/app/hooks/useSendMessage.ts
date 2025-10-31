// src/hooks/useSendMessage.ts
import { useState } from "react";
import { sendMessage } from "@/utils/sendMessage";

export function useSendMessage(chatId: string, token: string) {
    const [loading, setLoading] = useState(false);

    const send = async (text: string, sender: "maker" | "creator") => {
        try {
            setLoading(true);
            const response = await sendMessage({ chatId, token, type: 'text', content: text });
            return response.data; // the new message from backend
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { send, loading };
}
