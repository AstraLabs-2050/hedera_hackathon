"use client";

import { useState } from "react";
import { UserTextMsg } from "@/types/chat";
import Image from "next/image";
import { AVATAR_CREATOR, AVATAR_MAKER } from "@/utils/avatars";

// const AVATAR_MAKER = "/avatars/maker.png"; // Replace with your path
// const AVATAR_CREATOR = "/avatars/creator.png"; // Replace with your path

export default function UserMessage({
    msg,
    currentRole,
    onRetry,
}: {
    msg: UserTextMsg;
    currentRole: "creator" | "maker";
    onRetry?: (clientMessageId: string) => void;
}) {
    const isMine = msg.sender === currentRole;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Determine avatar based on sender, not on message data
    const avatar = msg.sender === "creator" ? AVATAR_CREATOR : AVATAR_MAKER;

    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = url.split("/").pop() || "image.jpg";
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    const ImageWithRetry = ({ url }: { url: string }) => (
        <div className="relative inline-block mt-3 group">
            <Image
                src={url}
                alt="uploaded"
                width={280}
                height={280}
                className="rounded-xl object-cover max-h-[220px] w-auto cursor-pointer hover:opacity-90 transition"
                onClick={() => setPreviewUrl(url)}
            />
            <button
                onClick={() => handleDownload(url)}
                className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition"
            >
                ⬇ Download
            </button>

            {msg.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {msg.status === "failed" && onRetry && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <button
                        onClick={() => onRetry(msg.clientMessageId)}
                        className="bg-white text-gray-700 px-4 py-2 rounded-full shadow hover:bg-gray-100"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );

    const formattedTime = new Date(msg.time || Date.now()).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });

    const StatusTick = () => {
        if (!isMine) return null;
        switch (msg.status) {
            case "pending":
                return <span>🕒</span>;
            case "sent":
                return <span>✓</span>;
            case "delivered":
                return <span>✓✓</span>;
            case "read":
                return <span className="text-blue-500">✓✓</span>;
            default:
                return null;
        }
    };

    return (
        <>
            <div className={`flex gap-2 px-4 items-end ${isMine ? "justify-end" : "justify-start"}`}>
                {/* Left avatar */}
                {!isMine && (
                    <Image
                        src={avatar}
                        alt="avatar"
                        width={36}
                        height={36}
                        className="rounded-full w-9 h-9 object-cover self-start"
                    />
                )}

                <div className={`px-4 py-3 shadow-sm max-w-xl rounded-2xl ${
                    isMine ? "bg-[#f9f9f9] rounded-br-none" : "bg-[#F9F9F9] rounded-bl-none"
                }`}>
                    {msg.data?.text && <p>{msg.data.text}</p>}

                    {msg.data?.imageUrl && <ImageWithRetry url={msg.data.imageUrl} />}

                    {msg.data?.imageUrls && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {msg.data.imageUrls.map((url: string, i: number) => (
                                <ImageWithRetry key={i} url={url} />
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end items-center gap-1 mt-1 text-xs text-gray-400">
                        <span>{formattedTime}</span>
                        <StatusTick />
                    </div>
                </div>

                {/* Right avatar */}
                {isMine && (
                    <Image
                        src={avatar}
                        alt="avatar"
                        width={36}
                        height={36}
                        className="rounded-full w-9 h-9 object-cover self-end"
                    />
                )}
            </div>

            {previewUrl && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="relative max-w-3xl max-h-[85vh] w-auto p-4">
                        <button
                            onClick={() => setPreviewUrl(null)}
                            className="absolute -top-4 -right-4 w-11 h-11 bg-white text-black rounded-full p-2 shadow-md hover:bg-gray-200"
                        >
                            ✕
                        </button>
                        <Image
                            src={previewUrl}
                            alt="preview"
                            width={900}
                            height={900}
                            className="rounded-xl object-contain max-h-[80vh] w-auto shadow-lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
