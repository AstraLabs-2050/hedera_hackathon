"use client";

import React, { useState, useCallback, useEffect } from "react";
import api from "@/utils/api.class";
import ChatSidebar from "../component/ChatSidebar";
import { Sparkles } from "lucide-react";
import { FaRegArrowAltCircleDown } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ChatIndexPage: React.FC = () => {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  const MAX_RETRY_ATTEMPTS = 3;

  // Enhanced error handling with retry logic
  const handleError = useCallback(
    (err) => {
      const errorMessage = err.message || "Failed to create chat";
      setError(errorMessage);

      // Auto-retry for network errors
      if (err.name === "NetworkError" && retryCount < MAX_RETRY_ATTEMPTS) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1);
            setError(null);
            handleNew();
          },
          3000 * Math.pow(2, retryCount)
        ); // Exponential backoff
      }
    },
    [retryCount]
  );

  // Enhanced chat creation with better UX
  const handleNew = useCallback(async () => {
    if (starting) return; // Prevent double-clicks

    setStarting(true);
    setError(null);

    try {
      const res = await api.startChat();

      if (res.status && res.data?.id) {
        // Enhanced navigation with loading state
        const chatUrl = `/dashboard/aiagent/chat/${res.data.id}`;

        if (typeof window !== "undefined") {
          // Added a small delay for better UX feedback
          setTimeout(() => {
            router.push(chatUrl);
          }, 100);
        }
      } else {
        throw new Error(
          res.message || "Failed to start chat - invalid response"
        );
      }
    } catch (err) {
      handleError(err);
    } finally {
      // Keep loading state for a moment during navigation
      setTimeout(() => setStarting(false), 500);
    }
  }, [starting, handleError]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    handleNew();
  }, [handleNew]);

  // Handler for new chat created from sidebar
  const handleNewChatFromSidebar = useCallback((chatId: string) => {
    // The navigation is handled in the ChatSidebar component
  }, []);

  // Handler for chat deleted from sidebar
  const handleChatDeleted = useCallback((chatId: string) => {}, []);

  // Keyboard shortcut for new chat (Ctrl/Cmd + N)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n" && !starting) {
        e.preventDefault();
        handleNew();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [handleNew, starting]);

  // Quick prompt suggestions
  const promptSuggestions = [
    "Craft the grace of a Swahili coastal attire",
    "Bring to life a regal Yoruba wedding dress",
    "Reimagine Shweshwe fabric as a runway gown",
    "Design a vintage-style jacket",
  ];

  const handlePromptClick = useCallback(
    (prompt: string) => {
      // Start new chat with pre-filled prompt
      localStorage.setItem("pendingPrompt", prompt);
      handleNew();
    },
    [handleNew]
  );

  return (
    <div className='relative flex w-full h-full bg-gray-50 overflow-y-hidden'>
      <main className='flex flex-1 w-full h-full flex-col overflow-y-auto'>
        <div className='flex-1 flex items-center justify-center p-6'>
          <div className='text-center max-w-2xl space-y-8'>
            {/* Hero section */}
            <div className='space-y-4'>
              <h1 className='font-bold text-gray-900 leading-tight'>
                Welcome to your Creative{" "}
                <span className='bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
                  Space
                </span>
              </h1>

              <div className='flex justify-center items-center flex-wrap gap-2 text-sm text-gray-500 leading-relaxed'>
                <FaRegArrowAltCircleDown size={16} />
                <span>
                  Create your collection using AI and bring your ideas to life
                </span>
              </div>
            </div>

            {/* Error display with retry */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-red-600'>{error}</p>
                  {retryCount < MAX_RETRY_ATTEMPTS && (
                    <button
                      onClick={handleRetry}
                      className='text-sm text-red-600 hover:text-red-800 underline focus:outline-none'>
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Main CTA */}
            <div className='space-y-4'>
              <button
                onClick={handleNew}
                disabled={starting}
                className={`group relative px-8 py-2 bg-[radial-gradient(circle_at_center,_#f2f2f2_10%,_#DBDBDB_90%)] rounded-2xl font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
                  starting ? "animate-pulse" : ""
                }`}>
                {starting ? (
                  <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-gray-800'>
                      Creating Your Design Studio...
                    </span>
                  </div>
                ) : (
                  <div className='flex items-center gap-3'>
                    <div className='flex-shrink-0 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center'>
                      <Image
                        src='/agent.svg'
                        alt='AI Agent'
                        width={20}
                        height={20}
                        priority
                        className='w-5 h-auto'
                      />
                    </div>
                    <span className='text-blue-700 leading-relaxed'>
                      Start Designing Now
                    </span>
                  </div>
                )}
              </button>

              <div className='flex items-center justify-center  '>
                <Link
                  href='/dashboard/upload-design'
                  className='flex items-center gap-4 bg-primary-foreground px-3 py-2 border border-gray-300 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none'>
                  <p className='text-sm text-blue-700'>
                    Already have a design?
                  </p>
                  Upload here
                </Link>
              </div>
            </div>

            {/* Quick prompt suggestions */}
            <div className='space-y-4'>
              <h3 className='font-medium text-gray-600'>Ideas to try:</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {promptSuggestions.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    disabled={starting}
                    className='p-3 text-left bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200'>
                        <Sparkles size={16} className='text-blue-600' />
                      </div>
                      <span className='text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200'>
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ChatSidebar
        activeChatId={undefined}
        onNewChat={handleNewChatFromSidebar}
        onChatDeleted={handleChatDeleted}
      />
    </div>
  );
};

export default ChatIndexPage;
