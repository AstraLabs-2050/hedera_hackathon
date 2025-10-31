// src/types/chatDemo.ts

// 👇 This is only for sending payloads to backend
export type OutgoingMessagePayload = {
  clientMessageId: string;
  conversationId: string;
  from: "maker" | "creator" | "system";
  to: "maker" | "creator";
  content: string;
  kind: string;
  data: any;
};
