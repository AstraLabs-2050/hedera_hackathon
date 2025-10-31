'use client';

import { SystemAcceptedMsg } from '@/types/chat';
import Image from 'next/image';

type Props = { msg: SystemAcceptedMsg };

export default function SystemAccepted({ msg }: Props) {
    const { projectTitle, description, timeline, amount } = msg.data;

    return (
        <div className="w-full flex justify-end my-4 px-4">
            <div className='bg-[#F9F9F9] p-4 rounded-md'>
            <div className="w-full max-w-[514px] bg-white rounded-lg shadow-sm border border-[#F2F2F2] overflow-hidden">
                <div className="bg-black text-white px-5 py-6 flex items-center justify-center gap-2 max-h-16 h-full">
                    <Image src='/application-white.svg' alt='Application Icon' width={24} height={24} />
                    <span className="text-sm font-[ClashGrotesk-bold]">Application Accepted</span>
                </div>

                <div className="p-6">
                    <h3 className="text-[15px] mb-2">{projectTitle}</h3>
                    <p className="text-sm text-[#4F4F4F] leading-relaxed mb-4">{description}</p>

                    <div className="rounded-xl border border-[#E0E0E0] p-4">
                        <div className="text-sm text-[#4F4F4F] mb-2">
                            <span className="">Timeline:</span> {timeline}
                        </div>
                        <div className="text-sm text-[#4F4F4F] mb-2">
                            <span className="">Amount to be paid:</span> {amount}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
