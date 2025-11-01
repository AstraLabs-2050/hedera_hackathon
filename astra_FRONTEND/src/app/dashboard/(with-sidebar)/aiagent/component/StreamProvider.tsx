"use client";
import React, { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import api from "@/utils/api.class";

export const StreamContext = React.createContext<StreamChat | null>(null);

export const StreamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [client, setClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .getStreamChatToken()
      .then(({ data }) => {
        if (!mounted) return;
        const { apiKey, token, userId } = data;
        const streamClient = new StreamChat(apiKey);
        streamClient
          .connectUser({ id: userId, name: userId }, token)
          .then(() => setClient(streamClient))
          .catch(console.error);
      })
      .catch(console.error);

    return () => {
      mounted = false;
      client?.disconnectUser().catch(() => {});
    };
  }, []);

  if (!client) {
    return (
      <div className='flex gap-2 justify-center items-center h-full w-full'>
        <div className='flex items-center justify-center h-64'>
          <div className='w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
        </div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <StreamContext.Provider value={client}>{children}</StreamContext.Provider>
  );
};
