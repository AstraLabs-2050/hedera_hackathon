'use client';

import { EscrowPaymentMsg } from '@/types/chat';
import Image from 'next/image';

type Props = { msg: EscrowPaymentMsg };

export default function EscrowPayment({ msg }: Props) {
    const { projectTitle, description, outfitBalance, amount } = msg.data;

    return (
        <div className="w-full flex justify-end my-4 px-4">
            <div className="bg-[#F9F9F9] p-4 rounded-md w-full max-w-[514px]">
                <div className="bg-white rounded-lg shadow-sm border border-[#F2F2F2] overflow-hidden w-full">
                    {/* Header */}
                    <div className="bg-black text-white px-5 py-6 flex items-center justify-center gap-2 max-h-16 h-full">
                        <Image
                            src="/assured_workload.svg"
                            alt="Application Icon"
                            width={24}
                            height={24}
                        />
                        <span className="text-sm font-[ClashGrotesk-bold]">
                            Pay into Escrow
                        </span>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <h3 className="text-[15px] mb-2">{projectTitle}</h3>
                        <p className="text-sm text-[#4F4F4F] leading-relaxed mb-4">
                            {description}
                        </p>

                        <div className="rounded-xl border border-[#E0E0E0] p-4">
                            <div className="text-sm text-[#4F4F4F] mb-2">
                                <span className="">Outfit Balance:</span> {outfitBalance}
                            </div>
                            <div className="text-sm text-[#4F4F4F] mb-4">
                                <span className="">Amount to be pay:</span> {amount}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                                <button className="bg-black px-4 py-4 sm:max-w-[210px] w-full text-xs text-white rounded-full">
                                    Make Payment
                                </button>
                                <button className="bg-white border sm:max-w-[210px] w-full border-black rounded-full px-4 py-4 text-xs text-black">
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
