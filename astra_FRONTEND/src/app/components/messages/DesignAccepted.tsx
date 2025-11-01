'use client';

import Image from 'next/image';

type Props = {
    align?: 'left' | 'right';
    msg: {
        data: {
            designId: string;
            imageUrl: string;
            title: string;
            price: string;
        };
    };
};

export default function DesignAccepted({ msg, align = 'left' }: Props) {
    const { imageUrl, title, price } = msg.data;

    // ✅ Ensure imageUrl is always a string
    const safeImageUrl = typeof imageUrl === 'string' && imageUrl ? imageUrl : '/placeholder.png';

    return (
        <div className={`w-full flex ${align === 'right' ? 'justify-end' : 'justify-start'} my-4 px-4`}>
            <div className="bg-[#F9F9F9] p-4 rounded-md">
                <div className="w-full max-w-[514px] bg-white rounded-lg shadow-sm border border-[#F2F2F2] overflow-hidden">
                    {/* Header */}
                    <div className="bg-black text-white px-5 py-6 flex items-center justify-center gap-2 max-h-16 h-full">
                        <Image
                            src="/application-white.svg"
                            alt="Design Accepted Icon"
                            width={24}
                            height={24}
                        />
                        <span className="text-sm font-[ClashGrotesk-bold]">Design Accepted</span>
                    </div>

                    {/* Design Info */}
                    <div className="p-6">
                        <div className="w-full rounded-lg overflow-hidden border border-[#E0E0E0] mb-4">
                            <Image
                                src={safeImageUrl}
                                alt={title || 'Design Image'}
                                width={500}
                                height={300}
                                className="object-cover w-full h-[240px]"
                            />
                        </div>

                        <h3 className="text-[15px] font-[ClashGrotesk-bold] mb-2">{title}</h3>
                        <p className="text-sm text-[#4F4F4F]">
                            <span className="font-[ClashGrotesk-bold]">Price:</span> {price}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
