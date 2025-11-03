// // 'use client';

// // import { useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import Cookies from 'js-cookie';
// // import { v4 as uuidv4 } from 'uuid';

// // type Props = {
// //     creatorId: string;
// //     designId: string;
// //     jobData: {
// //         title: string;
// //         price?: number;
// //     };
// //     token?: string;
// // };

// // export default function ChatWithCreatorButton({ creatorId, designId, jobData, token }: Props) {
// //     const [loading, setLoading] = useState(false);
// //     const router = useRouter();

// //     const getTokenFromCookies = () => Cookies.get('auth_token') || null;

// //     const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

// //     const handleChatWithCreator = async (designId: string) => {
// //         const finalToken = token || getTokenFromCookies();

// //         if (!creatorId) {
// //             console.error('⚠ No recipient found. Please sign up first.');
// //             router.push('/register');
// //             return;
// //         }

// //         if (!isValidUUID(designId)) {
// //             console.error('⚠ Invalid designId. Must be a valid UUID');
// //             console.log({ creatorId, designId });
// //             return;
// //         }

// //         try {
// //             setLoading(true);
// //             console.log('📦 Creating chat with payload:', { designId, recipientId: creatorId });

// //             // 1️⃣ Create chat
// //             const createRes = await fetch(
// //                 `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/create`,
// //                 {
// //                     method: 'POST',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                         Authorization: `Bearer ${finalToken}`,
// //                     },
// //                     body: JSON.stringify({ designId, recipientId: creatorId }),
// //                 }
// //             );

// //             if (!createRes.ok) {
// //                 const text = await createRes.text();
// //                 console.error('❌ Chat create failed:', createRes.status, text);
// //                 throw new Error('Failed to create chat');
// //             }

// //             const createData = await createRes.json();
// //             const chatId = createData?.data?.id;
// //             if (!chatId) throw new Error('No chatId returned');

// //             // 2️⃣ Prepare optimistic DesignAccepted message
// //             const clientMessageId = uuidv4();
// //             const optimisticDesignMsg = {
// //                 id: uuidv4(),
// //                 clientMessageId,
// //                 kind: 'system.accepted', // matches your DesignAccepted.tsx
// //                 sender: 'creator', // or 'maker', depends on who clicks
// //                 senderId: creatorId,
// //                 time: new Date().toISOString(),
// //                 status: 'sent',
// //                 data: {
// //                     title: jobData.title,
// //                     price: jobData.price,
// //                 },
// //             };

// //             // 3️⃣ Store optimistic message in localStorage
// //             localStorage.setItem('initialDesignAcceptedMsg', JSON.stringify(optimisticDesignMsg));

// //             // 4️⃣ Send first message to backend
// //             await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${chatId}/message`, {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     Authorization: `Bearer ${finalToken}`,
// //                 },
// //                 body: JSON.stringify({
// //                     content: `Hey, I would love to have this design made`,
// //                     type: 'text',
// //                 }),
// //             });

// //             console.log('✅ Chat created and first message sent');

// //             // 5️⃣ Navigate to Chatpay window
// //             router.push(`/dashboard/chatPay?chatId=${chatId}`);
// //         } catch (err) {
// //             console.error('❌ Error:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <button
// //             onClick={() => handleChatWithCreator(designId)}
// //             disabled={loading}
// //             className="px-4 py-2 bg-white text-black rounded-full font-medium 
// //                  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed 
// //                  transition-colors duration-150"
// //         >
// //             {loading ? 'Starting chat…' : 'Pay Into Escrow'}
// //         </button>
// //     );
// // }



// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { v4 as uuidv4 } from 'uuid';

// type Props = {
//     creatorId: string;
//     designId: string;
//     jobData: {
//         title: string;
//         price?: number;
//         imageUrl?:string;
//     };
//     token?: string;
// };

// export default function ChatWithCreatorButton({ creatorId, designId, jobData, token }: Props) {
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();

//     const getTokenFromCookies = () => Cookies.get('auth_token') || null;
//     const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

//     const handleChatWithCreator = async (designId: string) => {
//         const finalToken = token || getTokenFromCookies();

//         if (!creatorId) {
//             console.error('⚠ No recipient found. Please sign up first.');
//             router.push('/register');
//             return;
//         }

//         if (!isValidUUID(designId)) {
//             console.error('⚠ Invalid designId. Must be a valid UUID');
//             console.log({ creatorId, designId });
//             return;
//         }

//         try {
//             setLoading(true);
//             console.log('📦 Creating chat with payload:', { designId, recipientId: creatorId });

//             // 1️⃣ Create the chat room
//             const createRes = await fetch(
//                 `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/create`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${finalToken}`,
//                     },
//                     body: JSON.stringify({ designId, recipientId: creatorId }),
//                 }
//             );

//             if (!createRes.ok) {
//                 const text = await createRes.text();
//                 console.error('❌ Chat create failed:', createRes.status, text);
//                 throw new Error('Failed to create chat');
//             }

//             const createData = await createRes.json();
//             const chatId = createData?.data?.id;
//             if (!chatId) throw new Error('No chatId returned');

//             // 2️⃣ Prepare optimistic "DesignAccepted" message for UI preview
//             const clientMessageId = uuidv4();
//             const optimisticDesignMsg = {
//                 id: uuidv4(),
//                 clientMessageId,
//                 kind: 'system.accepted', // will be displayed by DesignAccepted component
//                 sender: 'creator',
//                 senderId: creatorId,
//                 time: new Date().toISOString(),
//                 status: 'sent',
//                 data: {
//                     title: jobData.title,
//                     price: jobData.price,
//                     imageUrl:jobData.imageUrl,
//                 },
//             };

//             // 3️⃣ Save optimistic message locally so ChatPay window shows it immediately
//             localStorage.setItem('initialDesignAcceptedMsg', JSON.stringify(optimisticDesignMsg));

//             // 4️⃣ Send real design inquiry message to backend
//             await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${chatId}/message`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${finalToken}`,
//                 },
//                 body: JSON.stringify({
//                     type: 'design_inquiry',
//                     designId,
//                     title: jobData.title,
//                     imageUrl:jobData.imageUrl,      
//                     content: 'Hey, I would love to have this design made!',
//                     price: jobData.price,
//                 }),
//             });

//             console.log('✅ Chat created & design inquiry sent');

//             // 5️⃣ Navigate to chat window
//             router.push(`/dashboard/chatPay?chatId=${chatId}`);
//         } catch (err) {
//             console.error('❌ Error starting chat:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <button
//             onClick={() => handleChatWithCreator(designId)}
//             disabled={loading}
//             className="px-4 py-2 bg-white text-black rounded-full font-medium 
//                  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed 
//                  transition-colors duration-150"
//         >
//             {loading ? 'Starting chat…' : 'Pay Into Escrow'}
//         </button>
//     );
// }



'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

type Props = {
    creatorId: string;
    designId: string;
    jobData: {
        title: string;
        price?: number;
    };
    token?: string;
};

export default function ChatWithCreatorButton({ creatorId, designId, jobData, token }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const getTokenFromCookies = () => Cookies.get('auth_token') || null;
    const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

    const handleChatWithCreator = async (designId: string) => {
        const finalToken = token || getTokenFromCookies();

        if (!creatorId) {
            console.error('⚠ No recipient found. Please sign up first.');
            router.push('/register');
            return;
        }

        if (!isValidUUID(designId)) {
            console.error('⚠ Invalid designId. Must be a valid UUID');
            console.log({ creatorId, designId });
            return;
        }

        try {
            setLoading(true);
            console.log('📦 Creating chat with payload:', { designId, recipientId: creatorId });

            // 1️⃣ Create chat
            const createRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${finalToken}`,
                    },
                    body: JSON.stringify({ designId, recipientId: creatorId }),
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

            console.log('✅ Chat created:', chatId);

            // 2️⃣ Send the image message first
            const imageUrl =
                'https://res.cloudinary.com/di2nkejas/image/upload/v1761402813/astra-fashion/designs/design_upload_1761402812599_1761402812600.png';

            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${chatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${finalToken}`,
                },
                body: JSON.stringify({
                    content: 'Hi',
                    type: 'image',
                    attachments: [imageUrl],
                }),
            });

            // (Optional) Wait briefly to ensure message order
            await new Promise((r) => setTimeout(r, 200));

            // 3️⃣ Send the text message
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${chatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${finalToken}`,
                },
                body: JSON.stringify({
                    content: `Hey, I’d love to have this ${jobData.title} design made!`,
                    type: 'text',
                }),
            });

            console.log('✅ Image + text messages sent successfully');

            // 4️⃣ Navigate to chat window
            router.push(`/dashboard/chatPay?chatId=${chatId}`);
        } catch (err) {
            console.error('❌ Error starting chat:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={() => handleChatWithCreator(designId)}
            disabled={loading}
            className="px-4 py-2 bg-white text-black rounded-full font-medium 
           hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed 
           transition-colors duration-150"
        >
            {loading ? 'Starting chat…' : 'Pay Into Escrow'}
        </button>
    );
}

