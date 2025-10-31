'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Send, Paperclip, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
    chatId: string;
    token: string;
    avatarCreator: string;
    avatarMaker: string;
    onSend: (text: string, sender: 'maker' | 'creator') => void;
    onAction?: (kind: 'measurement' | 'payment' | 'delivery' | 'release' | 'completion' | 'deliveryMeasurement') => void;
    onUpload?: (files: File[], sender: 'maker' | 'creator') => void;
    onTyping?: (sender: 'maker' | 'creator') => void;
    onStopTyping?: (sender: 'maker' | 'creator') => void;
};

export default function ChatpayInput({
    chatId,
    token,
    avatarCreator,
    avatarMaker,
    onSend,
    onAction,
    onUpload,
    onTyping,
    onStopTyping,
}: Props) {
    const [message, setMessage] = useState('');
    const [showQuickActions, setShowQuickActions] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Always sending as CREATOR
    const sender: 'creator' = 'creator';

    const handleSend = () => {
        const val = message.trim();
        if (!val) return;
        onSend(val, sender);
        setMessage('');
        onStopTyping?.(sender); // stop typing after sending
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload?.(Array.from(e.target.files), sender);
            e.target.value = '';
        }
    };

    return (
        <div className="border-t border-[#EFEFEF] p-8 bg-white relative">
            {/* Quick Actions */}
            <AnimatePresence>
                {showQuickActions && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.25 }}
                        className="absolute flex flex-col bottom-16 right-6 max-w-[210px] md:max-w-[374px] w-full bg-white border border-gray-200 shadow-lg rounded-xl p-4 z-10"
                    >
                        <button
                            className="self-center text-gray-500 hover:text-gray-700"
                            onClick={() => setShowQuickActions(false)}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <ul className="space-y-4 py-4">
                            <li>
                                <button
                                    onClick={() => {
                                        onAction?.('deliveryMeasurement');
                                        setShowQuickActions(false);
                                    }}
                                    className="flex items-center gap-2 text-gray-700"
                                >
                                    <Image src="/send delivery.svg" alt="Delivery + Measurement" width={20} height={20} />
                                    Send Delivery & Measurements
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        onAction?.('payment');
                                        setShowQuickActions(false);
                                    }}
                                    className="flex items-center gap-2 text-gray-700"
                                >
                                    <Image src="/requestPayment.svg" alt="Payment" width={20} height={20} />
                                    Make Payment
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        onAction?.('completion');
                                        setShowQuickActions(false);
                                    }}
                                    className="flex items-center gap-2 text-gray-700"
                                >
                                    <Image src="/confirm-payment.svg" alt="Completion" width={20} height={20} />
                                    Confirm Job Completion
                                </button>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Row */}
            <div className="flex items-center gap-2">
                {/* File Upload */}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFiles}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <Paperclip className="w-5 h-5 text-gray-500" />
                </button>

                {/* Message Input */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 h-16 pr-28 bg-[#F8F8F8] rounded-sm focus:outline-none text-[#4F4F4F]"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            onTyping?.(sender); // notify typing
                        }}
                        onBlur={() => onStopTyping?.(sender)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                        }}
                    />
                    <button
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white border rounded-full px-3 py-2 text-sm text-black hover:bg-gray-100 flex items-center gap-1"
                    >
                        {showQuickActions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        Quick Actions
                    </button>
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    className="p-2 rounded-full hover:bg-black hover:text-white"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
