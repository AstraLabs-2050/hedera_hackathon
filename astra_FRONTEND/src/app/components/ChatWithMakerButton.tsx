'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    makerId: string;
    jobId: string;
    jobData: {
        title: string;
        description: string;
        timeline?: string;
        budget?: number;
    };
    token?: string;
};

export default function ChatWithMakerButton({ makerId, jobId, jobData, token }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const getTokenFromCookies = () => {
        const match = document.cookie.match(/(^| )auth_token=([^;]+)/);
        return match ? match[2] : null;
    };

    const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

    const handleChatWithMaker = async () => {
        const finalToken = token || getTokenFromCookies();
        if (!finalToken) {
            console.error('⚠ No token found');
            return;
        }

        // ✅ Check that both makerId and jobId are valid UUIDs
        if (!isValidUUID(makerId) || !isValidUUID(jobId)) {
            console.error('⚠ Invalid makerId or jobId. Must be valid UUIDs');
            console.log({ makerId, jobId });
            return;
        }

        try {
            setLoading(true);

            console.log('📦 Creating chat with payload:', { makerId, jobId });

            // 1️⃣ Create the chat
            const createRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${finalToken}`,
                    },
                    body: JSON.stringify({ makerId, jobId }),
                }
            );

            if (!createRes.ok) {
                const text = await createRes.text();
                console.error('❌ Chat create failed:', createRes.status, text);
                throw new Error('Failed to create chat');
            }

            const createData = await createRes.json();
            const chatId = createData?.data?.id;
            if (!chatId) throw new Error('No chatId returned');

            // 2️⃣ Send the first system message
            const msgRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${chatId}/message`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${finalToken}`,
                    },
                    body: JSON.stringify({
                        content: "Application accepted",
                        type: "applicationAccepted",
                        actionType: "application_accepted",
                        applicationData: {
                            title: jobData?.title || "Untitled Job",
                            description: jobData?.description || "No description provided",
                            timeline: jobData?.timeline || "N/A",
                            amount: jobData?.budget || 0
                        }
                    }),
                }
            );

            if (!msgRes.ok) {
                const errorData = await msgRes.json().catch(() => null);
                console.error('❌ Failed to send first message:', msgRes.status, errorData);
                throw new Error('Failed to send first message');
            }

            console.log('✅ Chat created and first message sent');
            router.push(`/dashboard/chatPay?chatId=${chatId}`);
        } catch (err) {
            console.error('❌ Error:', err);
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
            {loading ? 'Starting chat…' : 'Accept and Chat'}
        </button>
    );
}
