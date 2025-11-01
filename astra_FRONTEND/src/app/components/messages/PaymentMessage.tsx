'use client';

import { useEffect, useState } from 'react';
import { PaymentMsg } from '@/types/chat';
import Image from 'next/image';

type Props = {
    msg: PaymentMsg;
    align?: 'left' | 'right';
    currentRole?: 'maker' | 'creator';
};

export default function PaymentMessage({ msg, align = 'left', currentRole }: Props) {
    const [displayAmount, setDisplayAmount] = useState<string>('');
    const { payerName } = msg.data || {};
    const isRight = align === 'right';

    useEffect(() => {
        // Try to use amount from message
        if (msg.data?.amount) {
            setDisplayAmount(msg.data.amount);
        } else {
            // fallback to localStorage if needed
            const stored = localStorage.getItem('latestMilestoneAmount');
            if (stored) setDisplayAmount(stored);
        }
    }, [msg]);

    // 👇🏾 Logic:
    // If viewer is creator → show "You"
    // If viewer is maker → show payerName (the actual name)
    const displayPayer = currentRole === 'creator' ? 'You were' : 'You';

    return (
        <div
            className={`w-full flex px-4 my-2 ${isRight ? 'justify-end' : 'justify-start'
                }`}
        >
            <div
                className={`flex items-end gap-2 max-w-xs ${isRight ? 'flex-row-reverse' : 'flex-row'
                    }`}
            >
                <Image
                    src="/user-fill.png"
                    alt="Avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                />

                <div
                    className={`max-w-[209px] w-full flex flex-col items-start rounded-2xl px-5 py-4 shadow-sm text-white bg-gradient-radial from-[#3F37C9] to-[#4361EE]
              ${isRight ? 'rounded-br-none' : 'rounded-bl-none'}
          `}
                >
                    <div className="self-start mb-2">
                        <Image
                            src="/payment.svg"
                            alt="Payment"
                            width={20}
                            height={20}
                        />
                    </div>
                    <div className="text-[15px] opacity-90 mb-1">
                        {/* {displayPayer}  */}
                        Paid:
                    </div>
                    <div className="text-4xl leading-none font-[ClashGrotesk-semibold]">${displayAmount || '—'}</div>
                </div>
            </div>
        </div>
    );
}
