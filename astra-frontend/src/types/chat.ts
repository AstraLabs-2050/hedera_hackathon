// Who can send messages
export type Sender = "maker" | "creator" | "system";

// All message kinds supported
export type MessageKind =
    | "system.accepted"
    | "payment"
    | "user"
    | "image"
    | "escrow.payment"
    | "action.payment"
    | "escrow.release"
    | "action.deliveryMeasurement"
    | "action.completed"
    | "deliveryMeasurement.card";

// Base structure for all messages
export type BaseMsg = {
    id: string;
    kind: MessageKind;
    sender: Sender;
    time: string;
    clientMessageId?: string;
    status?: "uploading" | "failed" | "uploaded" | "pending" | "sent" | "delivered" | "read";
    data: any;
    senderId?: string; // keep raw senderId from backend
};

export type ImageMsg = BaseMsg & {
    kind: "image";
    sender: "maker" | "creator" | "system";
    data: {
        // image canonical URL on server
        imageUrl: string;
        // optional local preview URL used for optimistic UI (object URL)
        previewUrl?: string;
        // optional caption or filename
        caption?: string;
        width?: number;
        height?: number;
    };
};

// ---------- Specific message types ----------

export type EscrowReleaseMsg = BaseMsg & {
    kind: "escrow.release";
    sender: "creator";
    data: {
        projectTitle?: string;
        description?: string;
        outfitBalance?: string;
        amount: string;
        milestone?: string;
        status?: "Pending" | "Released" | "Failed";
    };
};

export type SystemAcceptedMsg = BaseMsg & {
    kind: "system.accepted";
    sender: "system";
    data: {
        projectTitle: string;
        description: string;
        timeline: string;
        amount: string;
    };
};

export type EscrowPaymentMsg = BaseMsg & {
    kind: "escrow.payment";
    sender: "creator";
    data: {
        projectTitle: string;
        description: string;
        outfitBalance: string;
        amount: string;
    };
};

export type PaymentMsg = BaseMsg & {
    kind: "payment";
    sender: "system"; // system always triggers payments
    data?: {
        payerName?: string;
        amount: string;
        note?: string;
    };
};

export type ActionCompletedMsg = BaseMsg & {
    kind: "action.completed";
    data: {};
};

export type ActionPaymentMsg = BaseMsg & {
    kind: "action.payment";
    sender: "creator" | "maker";
    data: {
        milestone: string;
        amount?: string;
    };
};

export type UserTextMsg = BaseMsg & {
    kind: "user";
    sender: "maker" | "creator"; // ✅ only users can send text
    data: {
        text: string;
        avatar?: string;
        imageUrl?: string;
        file?: string;
    };
};

export type ActionDeliveryMeasurementMsg = BaseMsg & {
    kind: "action.deliveryMeasurement";
    sender: "creator" | "maker";
};

export type DeliveryMeasurementCardMsg = BaseMsg & {
    kind: "deliveryMeasurement.card";
    sender: "creator" | "maker" | "system";
    data: {
        country: string;
        fullName: string;
        phone: string;
        address: string;
        shippingStatus: "Shipping Sent" | "Delivered" | "Pending";
        neck?: string;
        chest?: string;
        armLeft?: string;
        armRight?: string;
        waist?: string;
        hips?: string;
        legs?: string;
        thighLeft?: string;
        thighRight?: string;
        calfLeft?: string;
        calfRight?: string;
        avatar?: string;
        weight?: string;
    };
};

// ---------- Union of all message shapes ----------
export type ChatMessage =
    | SystemAcceptedMsg
    | PaymentMsg
    | UserTextMsg
    | ActionPaymentMsg
    | EscrowPaymentMsg
    | EscrowReleaseMsg
    | ActionDeliveryMeasurementMsg
    | ActionCompletedMsg
    | DeliveryMeasurementCardMsg
    | ImageMsg;
