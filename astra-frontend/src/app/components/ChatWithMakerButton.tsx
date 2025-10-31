'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    makerId: string;
    token?: string; // optional (fallback to cookie)
};

export default function ChatWithMakerButton({ makerId, token }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const getTokenFromCookies = () => {
        const match = document.cookie.match(/(^| )auth_token=([^;]+)/);
        return match ? match[2] : null;
    };

    const handleChatWithMaker = async () => {
        const finalToken = token || getTokenFromCookies();
        if (!finalToken) {
            console.error("⚠️ No token found");
            return;
        }

        try {
            setLoading(true);

            // 1. Create the chat
            const createRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${finalToken}`,
                    },
                    body: JSON.stringify({ makerId }),
                }
            );

            if (!createRes.ok) throw new Error("Failed to create chat");
            const createData = await createRes.json();
            const chatId = createData?.data?.id;
            if (!chatId) throw new Error("No chatId returned");

            // 2. Send the first message (✅ use content + type)
            const msgRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${chatId}/message`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${finalToken}`,
                    },
                    body: JSON.stringify({
                        content: "Application accepted ✅",
                        type: "text",
                    }),
                }
            );

            if (!msgRes.ok) {
                const errorData = await msgRes.json().catch(() => null);
                console.error("❌ Failed to send first message:", msgRes.status, errorData);
                throw new Error("Failed to send first message");
            }
            console.log("✅ Chat created and first message sent");

            // 3. Redirect to chat page
            router.push(`/dashboard/chatPay?chatId=${chatId}`);
        } catch (err) {
            console.error("❌ Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleChatWithMaker}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium 
             hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
             transition-colors duration-150"
        >
            {loading ? "Starting chat…" : "Accept and Chat"}
        </button>

    );
}
