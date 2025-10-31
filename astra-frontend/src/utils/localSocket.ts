// utils/localSocket.ts
const channel = new BroadcastChannel("chat-room");

export function emitLocal(event: string, payload: any) {
    channel.postMessage({ event, payload });
}

export function onLocalMessage(callback: (event: string, payload: any) => void) {
    channel.onmessage = (msg) => {
        const { event, payload } = msg.data;
        callback(event, payload);
    };
}