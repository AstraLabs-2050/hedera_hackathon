'use client';

import { ActionCompletedMsg } from '@/types/chat';
import Image from 'next/image';

type Props = {
    msg: ActionCompletedMsg;
    avatarUrl?: string;
};

export default function ActionCompleted({ msg, avatarUrl }: Props) {
    return (
        <div className="w-full flex items-start gap-2 px-4">
            {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <Image src={avatarUrl} alt="avatar" width={36} height={36} className="rounded-full" />
            ) : null}

            <div className="max-w-[520px]">
                <div className="bg-[#F2F2F2] text-[#111] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                     <p className="text-[13px] leading-relaxed">
                        Thank you for doing a good job!
                    </p> 
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                    {new Date(msg.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}
