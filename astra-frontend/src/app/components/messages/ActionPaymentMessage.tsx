'use client';

import { ActionPaymentMsg } from '@/types/chat';
import Image from 'next/image'; type Props = {
    msg: ActionPaymentMsg; onApprove?: () => void;
    avatarUrl?: string;
};
export default function ActionPayment({ msg, onApprove, avatarUrl }: Props) {
    return (
        <div className="w-full flex items-start gap-2 px-4">
            {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element 
                <Image src={avatarUrl} alt="avatar" width={36} height={36} className="rounded-full" />) : null}
            <div className="max-w-[520px]">
                <div className="bg-[#F2F2F2] text-[#111] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <p className="text-[13px] leading-relaxed"> Kindly approve the first payment </p>
                </div>
                <div className="mt-2">
                    <button
                        onClick={onApprove} className="px-5 py-2 rounded-full border border-[#1D40C8] text-[15px] text-[#1D40C8] transition hover:bg-gradient-radial from-[#3F37C9] to-[#4361EE] hover:text-white" >
                        Approve Payment
                    </button>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                    {new Date(msg.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}