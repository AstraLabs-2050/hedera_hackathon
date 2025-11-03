'use client';
import { EscrowReleaseMsg } from "../../../types/chat";
import Image from "next/image";
import { useState } from "react";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { getContract } from "thirdweb";
import { ESCROW_ADDRESS, ESCROW_ABI } from "../../../constants/contracts";
import { useActiveAccount } from "thirdweb/react";
import { client } from '../../../client';
import { baseSepolia } from 'thirdweb/chains';

type Props = {
    msg: EscrowReleaseMsg;
    token: string; // JWT token
    onUpdate?: (newBalance: number) => void; // optional callback to update parent state
};

export default function EscrowRelease({ msg, token, onUpdate }: Props) {
    const { projectTitle, description, outfitBalance, amount, tokenId, chatId } = msg.data;
    const AVATAR_CREATOR = '/profilePicture.png';
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const account = useActiveAccount();
    const address = account?.address;

    // Initialize contract
    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
    });

    const handleCompleteMilestone = async () => {
        if (!tokenId || !account) return;

        try {
            setLoading(true);
            setStatus("Completing milestone...");

            const tokenIdBig = BigInt(tokenId);

            // 1️⃣ Blockchain transaction
            const transaction = prepareContractCall({
                contract,
                method: "completeMilestoneByAgent",
                params: [tokenIdBig],
            });

            const txResult = await sendTransaction({ transaction, account });
            setStatus("Milestone completed successfully on-chain!");

            // 2️⃣ Notify backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${chatId}/escrow/release`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount,
                    transactionHash: txResult.transactionHash,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to notify backend about milestone release");
            }

            setStatus("Funds released successfully!");

            // 3️⃣ Optionally update parent or local UI
            onUpdate?.(Number(outfitBalance) - Number(amount));

        } catch (error) {
            console.error("Error completing milestone:", error);
            setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-end px-4 my-3 gap-2">
            <div className="flex items-end gap-2 max-w-md w-full">
                <div className="rounded-2xl shadow-sm border bg-white w-full">
                    <div className="p-4 space-y-2 text-sm">
                        <div className="bg-black flex items-center justify-center gap-6 text-white p-6 rounded-md">
                            <Image src='/assured_workload.svg' alt='Application Icon' width={24} height={24} />
                            <h3 className="font-semibold">Escrow Release</h3>
                        </div>
                        <div className="space-y-1 text-gray-700">
                            <p className="font-semibold">{projectTitle}</p>
                            <p>{description}</p>
                            <p><span className="font-medium">Outfit Balance:</span> {outfitBalance}</p>
                            <p><span className="font-medium">Amount to Release:</span> {amount}</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleCompleteMilestone}
                                disabled={loading}
                                className="bg-black text-white px-4 py-4 max-w-[210px] w-full shadow-sm border-black rounded-full"
                            >
                                {loading ? "Processing..." : "Make Payment"}
                            </button>
                            <button className='bg-white border max-w-[210px] w-full border-black rounded-full px-4 py-4 text-black'>
                                Decline
                            </button>
                        </div>
                        {status && <p className="text-sm text-gray-500 mt-2">{status}</p>}
                    </div>
                </div>
                <Image src={AVATAR_CREATOR} alt="creator avatar" width={36} height={36} className="rounded-full w-9 h-9 object-cover self-end" />
            </div>
        </div>
    );
}










// 'use client';
// import { EscrowReleaseMsg } from "../../../types/chat";
// import Image from "next/image";
// type Props = {
//     msg: EscrowReleaseMsg;
//     onRelease: (amount: string) => void;
// };
// export default function EscrowRelease({ msg, onRelease }: Props) {
//     const { projectTitle, description, outfitBalance, amount } = msg.data;
//     const AVATAR_CREATOR = '/profilePicture.png';
//     return (
//         <div className="flex justify-end px-4 my-3 gap-2">
//             <div className="flex items-end gap-2 max-w-md w-full">
//                 {/* Escrow Card */}
//                 <div className="rounded-2xl shadow-sm border bg-white w-full">
//                     <div className="p-4 space-y-2 text-sm">
//                         <div className="bg-black flex items-center justify-center gap-6 text-white p-6 rounded-md">
//                             <Image src='/assured_workload.svg' alt='Application Icon' width={24} height={24} />
//                             <h3 className="font-semibold">Escrow Release</h3>
//                         </div> <div className="space-y-1 text-gray-700">
//                             <p className="font-semibold">{projectTitle}</p>
//                             <p>{description}</p>
//                             <p> <span className="font-medium">Outfit Balance:</span> {outfitBalance} </p>
//                             <p> <span className="font-medium">Amount to Release:</span> {amount} </p>
//                         </div>
//                         <div className="flex gap-4">
//                             <button onClick={() => onRelease(amount)} className="bg-black text-white px-4 py-4 max-w-[210px] w-full shadow-sm border-black rounded-full" >
//                                 Make Payment
//                             </button>
//                             <button className='bg-white border max-w-[210px] w-full border-black rounded-full px-4 py-4 text-black'>
//                                 Decline
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//                 {/* Avatar */}
//                 <Image src={AVATAR_CREATOR} alt="creator avatar" width={36} height={36} className="rounded-full w-9 h-9 object-cover self-end" />
//             </div>
//         </div>
//         );
// }