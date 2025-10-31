'use client';
import { EscrowReleaseMsg } from "../../../types/chat";
import Image from "next/image";
type Props = {
    msg: EscrowReleaseMsg;
    onRelease: (amount: string) => void;
};
export default function EscrowRelease({ msg, onRelease }: Props) {
    const { projectTitle, description, outfitBalance, amount } = msg.data;
    const AVATAR_CREATOR = '/profilePicture.png';
    return (
        <div className="flex justify-end px-4 my-3 gap-2">
            <div className="flex items-end gap-2 max-w-md w-full">
                {/* Escrow Card */}
                <div className="rounded-2xl shadow-sm border bg-white w-full">
                    <div className="p-4 space-y-2 text-sm">
                        <div className="bg-black flex items-center justify-center gap-6 text-white p-6 rounded-md">
                            <Image src='/assured_workload.svg' alt='Application Icon' width={24} height={24} />
                            <h3 className="font-semibold">Escrow Release</h3>
                        </div> <div className="space-y-1 text-gray-700">
                            <p className="font-semibold">{projectTitle}</p>
                            <p>{description}</p>
                            <p> <span className="font-medium">Outfit Balance:</span> {outfitBalance} </p>
                            <p> <span className="font-medium">Amount to Release:</span> {amount} </p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => onRelease(amount)} className="bg-black text-white px-4 py-4 max-w-[210px] w-full shadow-sm border-black rounded-full" >
                                Make Payment
                            </button>
                            <button className='bg-white border max-w-[210px] w-full border-black rounded-full px-4 py-4 text-black'>
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
                {/* Avatar */}
                <Image src={AVATAR_CREATOR} alt="creator avatar" width={36} height={36} className="rounded-full w-9 h-9 object-cover self-end" />
            </div>
        </div>
        );
}