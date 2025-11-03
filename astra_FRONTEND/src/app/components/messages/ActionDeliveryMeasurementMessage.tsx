// file: messages/ActionDeliveryMeasurementMessage.tsx
import React from 'react';
import { ActionDeliveryMeasurementMsg } from '@/types/chat';

type Props = {
    msg: ActionDeliveryMeasurementMsg;
    onOpenForm: () => void;
    avatarUrl?: string;
    viewerRole: 'maker' | 'creator';
};

export default function ActionDeliveryMeasurementMessage({ msg, onOpenForm, avatarUrl, viewerRole }: Props) {
    const isCreator = viewerRole === 'creator';

    return (
        <div className="w-full flex items-end gap-2 px-4">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" width={36} height={36} className="rounded-full" /> : null}

            <div className="max-w-[520px]">
                <div className="bg-[#F2F2F2] text-[#111] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <p className="text-[13px] leading-relaxed">
                        Please provide your delivery and measurement details.
                    </p>
                </div>

                <div className="mt-2">
                    {isCreator ? (
                        <button
                            onClick={onOpenForm}
                            className="px-5 py-2 rounded-full border border-[#1D40C8] text-[15px] text-[#1D40C8] hover:bg-gradient-radial from-[#3F37C9] to-[#4361EE] hover:text-white"
                        >
                            Fill Details
                        </button>
                    ) : (
                        <button
                            disabled
                            className="px-5 py-2 rounded-full border border-gray-300 text-[14px] text-gray-500 cursor-not-allowed"
                            title="Only the creator can fill this form"
                        >
                            Request sent — creator can fill
                        </button>
                    )}
                </div>

                <p className="mt-1 text-[11px] text-gray-400">
                    {new Date(msg.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}












// 'use client';

// import { ActionDeliveryMeasurementMsg } from '@/types/chat';

// type Props = {
//     msg: ActionDeliveryMeasurementMsg;
//     onOpenForm: () => void;
//     avatarUrl?: string;
// };

// export default function ActionDeliveryMeasurementMessage({ msg, onOpenForm, avatarUrl }: Props) {
//     return (
//         <div className="w-full flex items-end gap-2 px-4">
//             {avatarUrl ? (
//                 <img
//                 src={avatarUrl}
//                 alt="avatar"
//                 width={36}
//                 height={36}
//                 className="rounded-full"
//                 />
//             ) : null}

//             <div className="max-w-[520px]">
//                 <div className="bg-[#F2F2F2] text-[#111] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
//                     <p className="text-[13px] leading-relaxed">
//                         Please provide your delivery and measurement details.
//                     </p>
//                 </div>

//                 <div className="mt-2">
//                     <button
//                         onClick={onOpenForm}
//                         className="px-5 py-2 rounded-full border border-[#1D40C8] text-[15px] text-[#1D40C8] transition hover:bg-gradient-radial from-[#3F37C9] to-[#4361EE] hover:text-white"
//                     >
//                         Fill Details
//                     </button>
//                 </div>
//                 <p className="mt-1 text-[11px] text-gray-400">
//                     {new Date(msg.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
//                 </p>
//             </div>
//         </div>
//     );
// }
