import React, { useState, useEffect } from "react";
import Image from "next/image";

type Props = {
  customMessage?: string;
  showAvatar?: boolean;
};

const TypingIndicator: React.FC<Props> = ({
  customMessage,
  showAvatar = true,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  // Dynamic typing messages for fashion AI context
  const typingMessages = [
    "Thinking...",
    "Prepping response...",
    "In seconds...",
    "Almost ready...",
  ];

  // Cycle through messages every 2 seconds
  useEffect(() => {
    if (customMessage) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % typingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [customMessage, typingMessages.length]);

  const currentMessage = customMessage || typingMessages[messageIndex];

  return (
    <div className='flex items-start space-x-3 max-w-[70%]'>
      {/* Assistant avatar */}
      {showAvatar && (
        <div className='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-400 to-white/70 rounded-full flex items-center justify-center'>
          <Image
            src='/agent.svg'
            alt='AI Agent'
            width={20}
            height={20}
            priority
            className='w-5 h-auto animate-pulse'
          />
        </div>
      )}

      {/* Typing bubble */}
      <div className='bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm'>
        <div className='flex items-center gap-3'>
          {/* Enhanced dot animation */}
          <div className='flex gap-1'>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className='w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce'
                style={{
                  animationDelay: `${i * 200}ms`,
                  animationDuration: "1.4s",
                }}
              />
            ))}
          </div>

          {/* Dynamic typing message */}
          <span className='text-sm text-gray-600 italic animate-pulse'>
            {currentMessage}
          </span>
        </div>

        {/* Subtle shimmer effect */}
        <div className='mt-2 h-1 bg-gray-100 rounded-full overflow-hidden'>
          <div className='h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse w-1/3 transition-all duration-1000' />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
