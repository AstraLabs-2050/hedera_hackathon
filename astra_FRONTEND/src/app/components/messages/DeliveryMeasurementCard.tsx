'use client';

import { DeliveryMeasurementCardMsg } from '@/types/chat';
import Image from 'next/image';
import { AVATAR_CREATOR } from '@/utils/avatars';

export default function DeliveryMeasurementCard({
    msg,
    onRetry,
}: {
    msg: DeliveryMeasurementCardMsg;
    onRetry: () => void;
}) {

    const { country, fullName, phone, address, shippingStatus, avatar, ...measurements } = msg.data;

    type MeasurementKeys =
        | 'neck'
        | 'chest'
        | 'armLeft'
        | 'armRight'
        | 'waist'
        | 'hips'
        | 'legs'
        | 'thighLeft'
        | 'thighRight'
        | 'calfLeft'
        | 'calfRight'
        | 'weight';

    const allowedKeys: MeasurementKeys[] = [
        'neck', 'chest', 'armLeft', 'armRight',
        'waist', 'hips', 'legs', 'thighLeft',
        'thighRight', 'calfLeft', 'calfRight', 'weight',
    ];

    const measurementEntries = Object.entries(measurements).filter(([key]) =>
        allowedKeys.includes(key as MeasurementKeys)
    );

    const formatLabel = (key: string) => {
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2') // add space before capital letter
            .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
    };

    return (
        <div className="flex justify-end px-4 my-3">
            <div className="flex flex-col items-end gap-1 max-w-lg w-full">
                <div className="flex items-end gap-2 w-full">
                    {/* Card wrapper is relative so overlays sit on top */}
                    <div className="relative w-full">
                        {/* Card */}
                        <div className="bg-[#F9F9F9] rounded-md shadow-sm w-full p-4 space-y-6">
                            {/* Delivery */}
                            <div>
                                <div className="bg-black text-white px-4 py-3 flex items-center justify-center gap-2 rounded-md">
                                    <Image src="/location.svg" width={20} height={20} alt="location" />
                                    <span className="font-semibold">Delivery Details</span>
                                </div>
                                <div className="mt-3 text-[#111] text-sm space-y-1">
                                    <p>Country: {country}</p>
                                    <p>Name: {fullName}</p>
                                    <p>Phone: {phone}</p>
                                    <p>Address: {address}</p>
                                </div>
                            </div>

                            {/* Measurements */}
                            <div>
                                <div className="bg-black text-white px-4 py-3 flex items-center justify-center gap-2 rounded-md">
                                    <Image src="/measure.svg" width={20} height={20} alt="measure" />
                                    <span className="font-semibold">Measurements</span>
                                </div>
                                <ul className="grid grid-cols-2 gap-2 text-sm mt-3">
                                    {measurementEntries.map(([key, val]) =>
                                        val ? (
                                            <li key={key} className="flex justify-between">
                                                <span className="capitalize">{formatLabel(key)}</span>
                                                <span>{String(val)} {key === 'weight' ? 'KG' : 'CM'}</span>
                                            </li>
                                        ) : null
                                    )}
                                </ul>
                            </div>

                            {/* Timestamp inside card */}
                            <p className="mt-2 text-[11px] text-gray-400 text-right">
                                {msg.time
                                    ? new Date(msg.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                                    : new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>

                        {/* Overlays: uploading spinner or retry button */}
                        {msg.status === 'uploading' && (
                            <div className="absolute inset-0 rounded-md flex items-center justify-center bg-black bg-opacity-30">
                                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {msg.status === 'failed' && onRetry && (
                            <div className="absolute inset-0 rounded-md flex items-center justify-center bg-black bg-opacity-50">
                                <button
                                    onClick={onRetry}
                                    className="bg-white text-[#4a4a4a] p-3 rounded-full flex items-center gap-2"
                                >
                                    Retry
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#4A4A4A">
                                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.47-.53 2.82-1.41 3.86l1.46 1.46A7.933 7.933 0 0020 12c0-4.42-3.58-8-8-8zM5.95 5.14L4.5 6.6A7.933 7.933 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.47.53-2.82 1.41-3.86z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Avatar */}
                    <Image
                        src={avatar || AVATAR_CREATOR}
                        alt="creator avatar"
                        width={36}
                        height={36}
                        className="rounded-full w-9 h-9 object-cover self-end"
                    />
                </div>
            </div>
        </div>
    );
}
