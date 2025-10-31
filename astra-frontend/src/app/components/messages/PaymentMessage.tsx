'use client';

import { PaymentMsg } from '@/types/chat';
import Image from 'next/image';

type Props = { msg: PaymentMsg; align?: 'left' | 'right' };

export default function PaymentMessage({ msg, align = 'left' }: Props) {
    const { payerName, amount } = msg.data;

    const isRight = align === 'left';

    return (
        <div
            className={`w-full flex px-4 my-2 ${
                isRight ? 'justify-end' : 'justify-start'
            }`}
        >
            <div
                className={`flex items-end gap-2 max-w-xs ${
                    isRight ? 'flex-row-reverse' : 'flex-row'
                }`}
            >
                {/* Avatar */}
                <Image
                    src="/profilePicture.png"
                    alt="Avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                />

                {/* Message Bubble */}
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
                     You paid:
                    </div>
                    <div className="text-4xl leading-none">{amount}</div>
                </div>
            </div>
        </div>
    );
}
