import { ChatMessage } from "@/types/chat";

export default function SystemMessage({
    msg,
    currentRole,
    onAction,
}: {
    msg: ChatMessage;
    currentRole: "creator" | "maker";
    onAction?: (action: string, msg: ChatMessage) => void; // e.g. open modal
}) {
    // Example: Quick Action button (Maker sends, Creator clicks)
    if (msg.kind === "action.deliveryMeasurement") {
        if (currentRole === "creator") {
            return (
                <div className="flex justify-center my-4">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => onAction?.("openDeliveryForm", msg)}
                    >
                        Fill Delivery Measurement
                    </button>
                </div>
            );
        }
        return (
            <div className="text-gray-500 text-sm italic text-center my-2">
                Waiting for creator to fill delivery form...
            </div>
        );
    }

    // Example: Show filled delivery card
    if (msg.kind === "deliveryMeasurement.card") {
        return (
            <div className="bg-white shadow-md rounded-lg p-4 my-3 max-w-md mx-auto">
                <h3 className="font-semibold text-lg mb-2">Delivery Details</h3>
                <p><strong>Name:</strong> {msg.data.fullName}</p>
                <p><strong>Address:</strong> {msg.data.address}</p>
                <p><strong>Phone:</strong> {msg.data.phone}</p>
                <p><strong>Status:</strong> {msg.data.shippingStatus}</p>
            </div>
        );
    }

    // Example: System accepted project
    if (msg.kind === "system.accepted") {
        return (
            <div className="bg-gray-100 text-gray-700 p-3 rounded-lg text-sm text-center my-2">
                ✅ Project accepted: {msg.data.projectTitle}
            </div>
        );
    }

    return null; // fallback
}
