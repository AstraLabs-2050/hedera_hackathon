"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import api, { ChatMessage as BaseChatMessage } from "@/utils/api.class";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { StreamContext } from "./StreamProvider";
import TypingIndicator from "./TypingIndicator";
import GeneratingIndicator from "./GeneratingIndicator";
import Link from "next/link";
import MintDesignDialog from "@/app/components/MintDesignDialog";

type ChatMessage = BaseChatMessage & {
  attachments?: {
    type: string;
    url?: string;
    fallback?: string;
    image_url?: string;
    thumb_url?: string;
  }[];
  isOptimistic?: boolean;
  clientId?: string;
};

type Props = { chatId: string };

const ChatWindow: React.FC<Props> = ({ chatId }) => {
  const client = useContext(StreamContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  // For AI image variations
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    null
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [minted, setMinted] = useState(false);
  const [hasNewUserMessage, setHasNewUserMessage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Refs for performance and cleanup
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef(null);
  const hydratedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const lastMessageCountRef = useRef(0);
  const userScrolledTimeoutRef = useRef<NodeJS.Timeout>();

  const ASSISTANT_IDS = new Set(["assistant", "astra-ai"]);
  const MAX_RETRY_ATTEMPTS = 5;
  const SCROLL_THRESHOLD = 100; // pixels from bottom to consider "at bottom"

  // Memoized role determination
  const getRole = useCallback((userId?: string, currentUserId?: string) => {
    if (!userId) return "system";
    if (ASSISTANT_IDS.has(userId)) return "assistant";
    if (userId === currentUserId) return "user";
    return "system";
  }, []);

  // Function to refresh chat sidebar
  const refreshChatSidebar = useCallback(() => {
    // The global refresh function that we set up in ChatSidebar
    if (
      window &&
      typeof window !== "undefined" &&
      (window as any).refreshChatSidebar
    ) {
      (window as any).refreshChatSidebar();
    }
  }, []);

  // Check if user is near bottom of chat
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
  }, []);

  // Enhanced scroll detection
  const handleScroll = useCallback(() => {
    const nearBottom = isNearBottom();
    setIsUserScrolledUp(!nearBottom);

    // Hide new message indicator when user scrolls to bottom
    if (nearBottom) {
      setShowNewMessageIndicator(false);
    }

    // Clear the "user scrolled" timeout and set a new one
    if (userScrolledTimeoutRef.current) {
      clearTimeout(userScrolledTimeoutRef.current);
    }

    // Consider user as having manually scrolled for a short period
    userScrolledTimeoutRef.current = setTimeout(() => {
      // Re-check if still near bottom after timeout
      if (isNearBottom()) {
        setIsUserScrolledUp(false);
      }
    }, 150);
  }, [isNearBottom]);

  // Cleanup object URLs
  const cleanupObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore cleanup errors
      }
    });
    objectUrlsRef.current.clear();
  }, []);

  // Enhanced auto-scroll function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  // Scroll to bottom and hide indicator
  const handleScrollToBottomClick = useCallback(() => {
    scrollToBottom("smooth");
    setShowNewMessageIndicator(false);
    setIsUserScrolledUp(false);
  }, [scrollToBottom]);

  // Enhanced error handling with retry logic
  const handleError = useCallback(
    (err, context: string) => {
      // console.error(`Error in ${context}:`, err);
      if (
        err.name === "NetworkError" ||
        err.name === "TimeoutError" ||
        err.message === "Request timeout" ||
        (err.status >= 500 && err.status < 600)
      ) {
        // Log only, no UI disruption
        return;
      }
      const errorMessage = err.message || `Failed to ${context}`;
      setError(errorMessage);

      // Auto-retry logic
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setRetryCount((prev) => prev + 1);
      }
    },
    [retryCount]
  );

  // Optimized message update function
  const updateMessages = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      setMessages((prev) => {
        const updated = updater(prev);
        // Only update if messages actually changed
        if (JSON.stringify(updated) !== JSON.stringify(prev)) {
          return updated;
        }
        return prev;
      });
    },
    []
  );

  useEffect(() => {
    const key = `selected_${chatId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const { variation, url } = JSON.parse(stored);
      setSelectedVariation(variation);
      setSelectedImageUrl(url);
    }
    const mintKey = `minted_${chatId}`;
    if (localStorage.getItem(mintKey) === "true") {
      setMinted(true);
    }
  }, [chatId, minted]);

  // Setup Stream channel with enhanced error handling
  useEffect(() => {
    if (!client || !chatId) return;

    let mounted = true;

    const setupChannel = async () => {
      // Cancel any existing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const channel = client.channel("messaging", chatId, {
          members: [client.userID!, "astra-ai"],
        });

        await channel.watch();
        if (!mounted) return;

        channelRef.current = channel;

        // Enhanced hydration with progress tracking
        if (
          (channel.state?.messages?.length ?? 0) === 0 &&
          !hydratedRef.current
        ) {
          try {
            const res = await api.getChatById(chatId);
            const visibleMessages = res.data.messages.filter(
              (m) => m.role !== "system"
            );

            // Batch message sending for better performance
            const batchSize = 5;
            for (let i = 0; i < visibleMessages.length; i += batchSize) {
              if (!mounted) return;

              const batch = visibleMessages.slice(i, i + batchSize);
              await Promise.all(
                batch.map((m) =>
                  channel.sendMessage({
                    text: m.content,
                    user: {
                      id: m.role === "user" ? client.userID! : "astra-ai",
                    },
                  })
                )
              );
            }
            hydratedRef.current = true;
          } catch (hydrationError) {
            console.warn(
              "Hydration failed, continuing with empty chat:",
              hydrationError
            );
          }
        }

        if (!mounted) return;

        // Load and process stream messages
        const streamMessages: ChatMessage[] = (channel.state.messages || [])
          .filter((m) => m.text)
          .map((m) => ({
            id: m.id,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
            content: m.text,
            role: getRole(m.user?.id, client.userID),
            chatId,
            attachments: m.attachments || [],
          }))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        setMessages(streamMessages);
        lastMessageCountRef.current = streamMessages.length;
        setError(null);
        setLoading(false);

        // Scroll to bottom after loading (instant for initial load)
        setTimeout(() => scrollToBottom("auto"), 100);

        // Enhanced message subscription with deduplication
        const handleNewMessage = (event) => {
          const m = event.message as any;
          const clientId = (m.client_id ?? m.clientId) as string | undefined;

          const newMsg: ChatMessage = {
            id: m.id,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
            content: m.text,
            role: getRole(m.user?.id, client.userID),
            chatId,
            attachments: m.attachments || [],
          };

          if (newMsg.role === "assistant") {
            const lowerContent = newMsg.content.toLowerCase();

            if (
              lowerContent.includes("generate a visual") ||
              lowerContent.includes("this will take a moment") ||
              lowerContent.includes("generating another variation")
            ) {
              setIsGenerating(true);
            } else if (isGenerating) {
              setIsGenerating(false);
            }
            if (newMsg.attachments?.length > 0) {
              setIsGenerating(false);
            }
          }

          updateMessages((prevMessages) => {
            if (prevMessages.some((msg) => msg.id === m.id)) {
              return prevMessages;
            }

            const result = [...prevMessages, newMsg];

            if (
              newMsg.role === "assistant" &&
              newMsg.content?.includes("variation_") &&
              newMsg.content.includes("Would you like to bring this to life?")
            ) {
              const userSelection = newMsg.content.match(/variation_\d+/)?.[0];

              if (userSelection) {
                // Create a copy to avoid modifying result
                const searchMessages = [...result].reverse();
                const lastAiWithImages = searchMessages.find(
                  (msg) =>
                    msg.role === "assistant" &&
                    msg.content
                      .toLowerCase()
                      .includes("here are your design variations")
                );

                if (lastAiWithImages) {
                  const imageUrls =
                    lastAiWithImages.content
                      .match(/(https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|gif))/g)
                      ?.filter((url): url is string => !!url) || [];

                  const variations = imageUrls.map((url, i) => ({
                    id: `variation_${i + 1}`,
                    url,
                  }));

                  const chosen = variations.find((v) => v.id === userSelection);

                  if (chosen) {
                    setSelectedVariation(userSelection);
                    setSelectedImageUrl(chosen.url);
                    localStorage.setItem(
                      `selected_${chatId}`,
                      JSON.stringify({
                        variation: userSelection,
                        url: chosen.url,
                      })
                    );
                  }
                }
              }
            }

            if (clientId) {
              const optimisticIndex = prevMessages.findIndex(
                (msg) => msg.clientId === clientId || msg.id === clientId
              );
              if (optimisticIndex !== -1) {
                const updated = [...prevMessages];
                updated[optimisticIndex] = newMsg;

                if (newMsg.role === "assistant") {
                  setIsTyping(false);
                  refreshChatSidebar();
                }
                return updated;
              }
            }

            if (newMsg.role === "assistant") {
              setIsTyping(false);
              refreshChatSidebar();
            }

            return result;
          });
        };

        channel.on("message.new", handleNewMessage);

        // Enhanced typing indicators
        channel.on("typing.start", (event) => {
          if (event.user?.id === "astra-ai") {
            setIsTyping(true);
          }
        });

        channel.on("typing.stop", (event) => {
          if (event.user?.id === "astra-ai") {
            setIsTyping(false);
          }
        });

        return () => {
          if (mounted) {
            channel.off("message.new", handleNewMessage);
            channel.off("typing.start");
            channel.off("typing.stop");
          }
        };
      } catch (err) {
        if (!mounted || abortControllerRef.current?.signal.aborted) return;
        handleError(err, "load chat");
      }
    };

    setupChannel();

    return () => {
      mounted = false;
      cleanupObjectUrls();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (userScrolledTimeoutRef.current) {
        clearTimeout(userScrolledTimeoutRef.current);
      }
      try {
        if (channelRef.current) {
          channelRef.current.off();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [
    chatId,
    client,
    getRole,
    handleError,
    updateMessages,
    cleanupObjectUrls,
    scrollToBottom,
    refreshChatSidebar,
  ]);

  // Smart auto-scroll: only scroll if user is near bottom or if it's their own message
  useEffect(() => {
    const hasNewMessages = messages.length > lastMessageCountRef.current;

    if (hasNewMessages) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage?.role === "user";
      const shouldAutoScroll = isOwnMessage || !isUserScrolledUp;

      if (shouldAutoScroll) {
        // Use a slight delay to ensure DOM is updated
        setTimeout(() => scrollToBottom("smooth"), 50);
      } else {
        // Show new message indicator if user is scrolled up
        setShowNewMessageIndicator(true);
      }
    }

    lastMessageCountRef.current = messages.length;
  }, [messages.length, isUserScrolledUp, scrollToBottom, messages]);

  // Auto-scroll when typing indicator appears (if user is near bottom)
  useEffect(() => {
    if (isTyping && !isUserScrolledUp) {
      setTimeout(() => scrollToBottom("smooth"), 100);
    }
  }, [isTyping, isUserScrolledUp, scrollToBottom]);

  // Enhanced file validation
  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxFiles = 4;

      const errors: string[] = [];
      const valid: File[] = [];

      if (files.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return { valid: files.slice(0, maxFiles), errors };
      }

      files.forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: Unsupported file type`);
          return;
        }

        if (file.size > maxSize) {
          errors.push(`${file.name}: File too large (max 10MB)`);
          return;
        }

        valid.push(file);
      });

      return { valid, errors };
    },
    []
  );

  // Enhanced message sending with better error handling and optimization
  const handleSend = useCallback(
    async (content: string, files?: File[]) => {
      if (!channelRef.current || !client || sending) return;
      if (!content.trim() && (!files || files.length === 0)) return;

      // Validate files
      if (files && files.length > 0) {
        const { valid, errors } = validateFiles(files);
        if (errors.length > 0) {
          setError(errors.join(", "));
          return;
        }
        files = valid;
      }

      setSending(true);
      setError(null);
      setHasNewUserMessage(true);

      const clientId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // Create optimistic attachments with object URLs
      const optimisticAttachments = files?.map((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.add(url); // Track for cleanup
        return {
          type: "image",
          url,
          fallback: file.name,
        };
      });

      const optimisticMessage: ChatMessage = {
        id: clientId,
        clientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: content.trim(),
        role: "user",
        chatId,
        attachments: optimisticAttachments,
        isOptimistic: true,
      };

      // Add optimistic message immediately
      updateMessages((prev) => [...prev, optimisticMessage]);

      // Show typing indicator after a brief delay
      const typingTimeout = setTimeout(() => setIsTyping(true), 300);

      try {
        let attachments: any[] = [];
        let imageBase64: string | undefined;

        // Handle file uploads with progress tracking
        if (files && files.length > 0) {
          // Upload images to Stream concurrently
          const uploadPromises = files.map(async (file) => {
            try {
              const uploadResult = await channelRef.current.sendImage(file);
              return {
                type: "image",
                image_url: uploadResult.file,
                thumb_url: uploadResult.thumb || uploadResult.file,
                fallback: file.name,
              };
            } catch {
              return null;
            }
          });

          const uploadResults = await Promise.all(uploadPromises);
          attachments = uploadResults.filter(Boolean);

          // Convert first file to base64 for backend (optimized)
          if (files[0]) {
            try {
              imageBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(files[0]);
              });
            } catch (base64Error) {
              // console.warn("Failed to convert image to base64:", base64Error);
            }
          }
        }

        // Send message to Stream (this will trigger the real message event)
        await channelRef.current.sendMessage({
          text: content.trim(),
          user: { id: client.userID },
          client_id: clientId,
          attachments,
        });

        // Send to backend for AI processing (no timeout)
        await api.sendMessage({
          content: content.trim(),
          chatId,
          imageBase64,
        });

        clearTimeout(typingTimeout);

        // Refresh sidebar after successful send to update chat title
        setTimeout(() => {
          refreshChatSidebar();
        }, 500);
      } catch (err) {
        clearTimeout(typingTimeout);

        // Remove optimistic message on error
        updateMessages((prev) => prev.filter((m) => m.clientId !== clientId));

        handleError(err, "send message");
        setIsTyping(false);
      } finally {
        setSending(false);

        // Cleanup optimistic attachment URLs
        optimisticAttachments?.forEach((att) => {
          if (att.url && objectUrlsRef.current.has(att.url)) {
            URL.revokeObjectURL(att.url);
            objectUrlsRef.current.delete(att.url);
          }
        });
      }
    },
    [
      client,
      chatId,
      sending,
      updateMessages,
      handleError,
      validateFiles,
      refreshChatSidebar,
    ]
  );

  // Retry mechanism
  const handleRetry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    // Re-trigger the effect by updating a dependency
    if (channelRef.current) {
      channelRef.current.off();
      channelRef.current = null;
      hydratedRef.current = false;
    }
  }, []);

  const handleMintSuccess = useCallback(() => {
    setMinted(true);
  }, []);

  // Memoized message components for performance
  const messageComponents = useMemo(() => {
    return messages.map((m) => (
      <MessageBubble
        key={m.id}
        role={m.role === "user" ? "user" : "assistant"}
        content={m.content}
        attachments={m.attachments}
        isOptimistic={m.isOptimistic}
      />
    ));
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupObjectUrls();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (userScrolledTimeoutRef.current) {
        clearTimeout(userScrolledTimeoutRef.current);
      }
    };
  }, [cleanupObjectUrls]);

  return (
    <div className='flex-1 flex flex-col w-full bg-gray-50 text-black md:px-[20px] pt-3 h-full font-[ClashGrotesk-regular] relative'>
      {/* Enhanced error display with retry */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
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

      {/* Messages container with enhanced scrolling */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className='flex-1 overflow-auto px-5 space-y-4 h-full w-full scroll-smooth'>
        {/* Optimized message rendering */}
        {messageComponents}

        {/* Enhanced typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* NEW: Generating design indicator */}
        {isGenerating && <GeneratingIndicator />}

        {/* Scroll anchor */}
        <div ref={bottomRef} className='h-7' />
      </div>

      {/* New messages indicator */}
      {showNewMessageIndicator && (
        <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10'>
          <button
            onClick={handleScrollToBottomClick}
            className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2 text-sm'>
            <span>↓</span>
            <span>New messages</span>
          </button>
        </div>
      )}

      {selectedVariation && !minted ? (
        <div className='pb-5 py-2'>
          <MintDesignDialog
            chatId={chatId}
            selectedVariation={selectedVariation}
            selectedImageUrl={selectedImageUrl}
            mintKey={`minted_${chatId}`}
            onMintSuccess={handleMintSuccess}
          />
        </div>
      ) : minted ? (
        <div className='flex justify-center pb-5 py-2'>
          <div className='flex justify-center items-center text-left bg-white w-fit border border-gray-200 rounded-2xl px-3 py-[5px] shadow-sm'>
            <div className='flex items-start gap-2 p-3'>
              <div className='w-6 h-6 flex items-center justify-center rounded-full bg-green-100'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 text-green-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <div className='text-sm font-medium'>
                <p className='text-green-600 font-semibold tracking-wider'>
                  Design Published Successfully!
                </p>
                <p className='text-gray-500'>
                  Your design is now saved in Your{" "}
                  <Link
                    href='/dashboard/design'
                    className='underline underline-offset-2 text-gray-700'>
                    Design
                  </Link>{" "}
                  tab.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Enhanced message input with better UX */}
      {!selectedVariation && (
        <div className='px-2'>
          <MessageInput
            onSend={handleSend}
            disabled={sending || loading || isGenerating}
            isLoading={sending || isGenerating}
            placeholder={
              messages.length === 0
                ? "Describe your fashion design idea..."
                : "Continue the conversation..."
            }
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
