// normalizeSender.ts
export function normalizeSender(
    rawMessage: any,
    _context?: {
        currentUserId?: string | null;
        currentRole?: "maker" | "creator";
        makerId?: string | null;
        creatorId?: string | null;
    }
): "maker" | "creator" {
    // Always trust backend first
    if (rawMessage?.sender?.userType) {
        const type = rawMessage.sender.userType.toLowerCase();
        if (type === "maker" || type === "creator") {
            return type;
        }
    }

    // Optional fallback: check makerId/creatorId if passed in context
    if (_context?.makerId && rawMessage.senderId === _context.makerId) return "maker";
    if (_context?.creatorId && rawMessage.senderId === _context.creatorId) return "creator";

    console.warn("⚠️ normalizeSender fallback → defaulting to creator", rawMessage);
    return "creator";
}
