// "use client";

// import React, {
//   useEffect,
//   useState,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import api, { Chat } from "@/utils/api.class";
// import Link from "next/link";
// import { formatDistanceToNow } from "date-fns";
// import { Input } from "@/components/ui/input";
// import { Search, SquarePen, Trash2, MoreVertical, X } from "lucide-react";

// type Props = {
//   activeChatId?: string;
//   onChatDeleted?: (chatId: string) => void;
//   onNewChat?: (chatId: string) => void; // Added callback for new chat creation
// };

// const ChatSidebar: React.FC<Props> = ({
//   activeChatId,
//   onChatDeleted,
//   onNewChat,
// }) => {
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
//   const [isDeleting, setIsDeleting] = useState<string | null>(null);
//   const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

//   const searchTimeoutRef = useRef<NodeJS.Timeout>();
//   const abortControllerRef = useRef<AbortController | null>(null);

//   // Enhanced chat filtering with fuzzy search
//   const filterChats = useCallback((chats: Chat[], query: string) => {
//     if (!query.trim()) return chats;

//     const searchTerms = query.toLowerCase().split(" ").filter(Boolean);

//     return chats
//       .filter((chat) => {
//         // Get display title (from metadata.lastUserInput or fallback to title)
//         const displayTitle =
//           chat.metadata?.lastUserInput || chat.title || "Untitled chat";
//         const title = displayTitle.toLowerCase();
//         const content = chat.lastMessage?.toLowerCase() || "";
//         const searchText = `${title} ${content}`;

//         return searchTerms.every((term) => searchText.includes(term));
//       })
//       .sort((a, b) => {
//         // Prioritize title matches over content matches
//         const aTitle = (
//           a.metadata?.lastUserInput ||
//           a.title ||
//           ""
//         ).toLowerCase();
//         const bTitle = (
//           b.metadata?.lastUserInput ||
//           b.title ||
//           ""
//         ).toLowerCase();
//         const queryLower = query.toLowerCase();

//         const aTitleMatch = aTitle.includes(queryLower);
//         const bTitleMatch = bTitle.includes(queryLower);

//         if (aTitleMatch && !bTitleMatch) return -1;
//         if (!aTitleMatch && bTitleMatch) return 1;

//         // Fall back to date sorting
//         return (
//           new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//         );
//       });
//   }, []);

//   // Debounced search
//   useEffect(() => {
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     searchTimeoutRef.current = setTimeout(() => {
//       const filtered = filterChats(chats, searchQuery);
//       setFilteredChats(filtered);
//     }, 300);

//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, [chats, searchQuery, filterChats]);

//   // Enhanced data fetching with caching and error recovery
//   const fetchChats = useCallback(
//     async (force = false) => {
//       if (loading && !force) return;

//       // Cancel any existing request
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }

//       abortControllerRef.current = new AbortController();
//       setLoading(true);
//       setError(null);

//       try {
//         const res = await api.getAllChats();

//         if (abortControllerRef.current.signal.aborted) return;

//         // Enhanced filtering with better state management
//         const validChats = res.data
//           .filter(
//             (chat) =>
//               chat.state !== "intent" && chat.state !== "welcome" && chat.id // Ensure chat has valid ID
//           )
//           .sort(
//             (a, b) =>
//               new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//           );

//         setChats(validChats);
//         setFilteredChats(filterChats(validChats, searchQuery));
//       } catch (err) {
//         if (abortControllerRef.current?.signal.aborted) return;

//         // console.error("Failed to fetch chats:", err);
//         setError("Failed to load chats");

//         // Retry logic for network errors
//         if (err.name === "NetworkError") {
//           setTimeout(() => fetchChats(true), 2000);
//         }
//       } finally {
//         if (!abortControllerRef.current?.signal.aborted) {
//           setLoading(false);
//         }
//       }
//     },
//     [loading, searchQuery, filterChats]
//   );

//   // New chat creation handler
//   const handleNewChat = useCallback(async () => {
//     if (isCreatingNewChat) return;

//     setIsCreatingNewChat(true);
//     setError(null);

//     try {
//       const res = await api.startChat();

//       if (res.status && res.data?.id) {
//         // Refresh the chat list to include the new chat
//         await fetchChats(true);

//         // Notify parent component about the new chat
//         onNewChat?.(res.data.id);

//         // Navigate to the new chat
//         const chatUrl = `/dashboard/aiagent/chat/${res.data.id}`;
//         window.location.href = chatUrl;
//       } else {
//         throw new Error(
//           res.message || "Failed to start chat - invalid response"
//         );
//       }
//     } catch (err) {
//       // console.error("Failed to create new chat:", err);
//       setError("Failed to create new chat");
//     } finally {
//       setIsCreatingNewChat(false);
//     }
//   }, [isCreatingNewChat, fetchChats, onNewChat]);

//   // Delete chat functionality
//   const handleDeleteChat = useCallback(
//     async (chatId: string, e?: React.MouseEvent) => {
//       if (e) {
//         e.preventDefault();
//         e.stopPropagation();
//       }

//       if (!confirm("Are you sure you want to delete this chat?")) return;

//       setIsDeleting(chatId);

//       try {
//         // await api.deleteChat(chatId); // Uncomment when API is available

//         // Optimistic update
//         setChats((prev) => prev.filter((chat) => chat.id !== chatId));
//         setActionMenuOpen(null);
//         onChatDeleted?.(chatId);

//         // If deleting active chat, redirect to main chat page
//         if (chatId === activeChatId) {
//           window.location.href = "/dashboard/aiagent/chat";
//         }
//       } catch (err) {
//         // console.error("Failed to delete chat:", err);
//         setError("Failed to delete chat");
//       } finally {
//         setIsDeleting(null);
//       }
//     },
//     [activeChatId, onChatDeleted]
//   );

//   // Function to refresh chats (can be called from parent)
//   const refreshChats = useCallback(() => {
//     fetchChats(true);
//   }, [fetchChats]);

//   // Expose refresh function to parent component
//   useEffect(() => {
//     if (window && typeof window !== "undefined") {
//       (window as any).refreshChatSidebar = refreshChats;
//     }
//   }, [refreshChats]);

//   // Initial load
//   useEffect(() => {
//     fetchChats();

//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, []);

//   // Enhanced search handler
//   const handleSearchChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       setSearchQuery(e.target.value);
//     },
//     []
//   );

//   // Clear search
//   const clearSearch = useCallback(() => {
//     setSearchQuery("");
//   }, []);

//   // Utility function to get display title
//   const getDisplayTitle = useCallback((chat: Chat) => {
//     const lastUserInput = chat.metadata?.lastUserInput;
//     if (lastUserInput && lastUserInput.trim()) {
//       // Truncate to reasonable length for sidebar
//       return lastUserInput.length > 50
//         ? lastUserInput.substring(0, 50).trim() + "..."
//         : lastUserInput;
//     }
//     return chat.title || "Untitled Chat";
//   }, []);

//   // Memoized chat items for performance
//   const chatItems = useMemo(() => {
//     return filteredChats.map((chat) => {
//       const isActive = chat.id === activeChatId;
//       const isBeingDeleted = isDeleting === chat.id;
//       const displayTitle = getDisplayTitle(chat);

//       return (
//         <li key={chat.id} className='group relative'>
//           <Link
//             href={`/dashboard/aiagent/chat/${chat.id}`}
//             className={`block px-3 py-2 rounded-xl transition-all duration-200 ${
//               isActive
//                 ? "bg-gray-50 border border-gray-200"
//                 : "hover:bg-gray-50 border border-transparent"
//             } ${isBeingDeleted ? "opacity-50 pointer-events-none" : ""}`}>
//             <div className='flex items-start justify-between gap-2'>
//               <div className='flex-1 min-w-0'>
//                 <div className='text-sm font-medium text-gray-900 truncate'>
//                   {displayTitle}
//                 </div>

//                 <div className='text-xs text-gray-400 mt-1 flex items-center gap-2'>
//                   <span>
//                     {formatDistanceToNow(new Date(chat.updatedAt))} ago
//                   </span>
//                 </div>
//               </div>

//               {/* Action menu */}
//               <div className='relative opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     setActionMenuOpen(
//                       actionMenuOpen === chat.id ? null : chat.id
//                     );
//                   }}
//                   className='p-1 hover:bg-gray-200 rounded transition-colors duration-200 focus:outline-none'
//                   aria-label='Chat actions'>
//                   <MoreVertical size={14} />
//                 </button>

//                 {/* Dropdown menu */}
//                 {actionMenuOpen === chat.id && (
//                   <div className='absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]'>
//                     <button
//                       onClick={(e) => handleDeleteChat(chat.id, e)}
//                       className='w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200'>
//                       <Trash2 size={14} />
//                       Delete
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Loading indicator for deleting chat */}
//             {isBeingDeleted && (
//               <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg'>
//                 <div className='w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin'></div>
//               </div>
//             )}
//           </Link>
//         </li>
//       );
//     });
//   }, [
//     filteredChats,
//     activeChatId,
//     isDeleting,
//     actionMenuOpen,
//     handleDeleteChat,
//     getDisplayTitle,
//   ]);

//   // Click outside to close action menu
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (actionMenuOpen) {
//         setActionMenuOpen(null);
//       }
//     };

//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, [actionMenuOpen]);

//   return (
//     <div className='hidden md:flex flex-col border border-[#F2F2F2] h-[88vh] w-64 min-w-[256px] border-r overflow-hidden bg-white'>
//       {/* Header */}
//       <div className='p-4 border-b border-gray-100 bg-gray-50'>
//         <div className='flex items-center justify-between mb-4'>
//           <h3 className='text-sm font-medium text-gray-800'>Design History</h3>
//           <button
//             onClick={handleNewChat}
//             disabled={isCreatingNewChat}
//             className='text-sm text-gray-600 hover:text-gray-800 items-center flex gap-1.5 px-2 py-1 rounded-md bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'>
//             {isCreatingNewChat ? (
//               <>
//                 <div className='w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin'></div>
//                 <span>Creating...</span>
//               </>
//             ) : (
//               <>
//                 <SquarePen size={14} />
//                 New
//               </>
//             )}
//           </button>
//         </div>

//         {/* Enhanced search */}
//         <div className='relative'>
//           <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
//           <Input
//             type='text'
//             placeholder='Search your designs...'
//             value={searchQuery}
//             onChange={handleSearchChange}
//             className='pl-9 pr-8 text-sm'
//             aria-label='Search previous chats'
//           />

//           {/* Clear search button */}
//           {searchQuery && (
//             <button
//               onClick={clearSearch}
//               className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none'
//               aria-label='Clear search'>
//               <X size={14} />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Chat list */}
//       <div className='flex-1 overflow-y-auto h-full p-2 pb-5 space-y-1'>

//         {/* Error state with retry */}
//         {error && (
//           <div className='p-4 text-center space-y-3'>
//             <p className='text-sm text-gray-400 italic'>
//               Error loading history
//             </p>
//           </div>
//         )}

//         {/* Empty state */}
//         {!loading && chats.length === 0 && !error && (
//           <div className='flex flex-col items-center justify-center h-64 text-center space-y-4 p-4'>
//             <div className='text-4xl'>🎨</div>
//             <div className='space-y-2'>
//               <h4 className='font-medium text-gray-900'>No designs yet</h4>
//               <p className='text-sm text-gray-500'>
//                 Start your first design conversation to see it here
//               </p>
//             </div>
//             <button
//               onClick={handleNewChat}
//               disabled={isCreatingNewChat}
//               className='text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
//               {isCreatingNewChat ? "Creating..." : "Create First Design"}
//             </button>
//           </div>
//         )}

//         {/* No search results */}
//         {!loading &&
//           searchQuery &&
//           filteredChats.length === 0 &&
//           chats.length > 0 && (
//             <div className='text-center py-8 space-y-3'>
//               <Search size={32} className='text-gray-300 mx-auto' />
//               <div>
//                 <p className='text-sm text-gray-600'>No designs found</p>
//                 <p className='text-xs text-gray-400'>Try different keywords</p>
//               </div>
//               <button
//                 onClick={clearSearch}
//                 className='text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none'>
//                 Clear search
//               </button>
//             </div>
//           )}

//         {/* Chat list */}
//         <ul className='space-y-[2px]'>{chatItems}</ul>

//         {/* Load more button (if pagination is needed) */}
//         {!loading && filteredChats.length >= 20 && (
//           <div className='p-4 text-center'>
//             <button
//               onClick={() => fetchChats(true)}
//               className='text-sm text-primary hover:text-gray-800 underline focus:outline-none'>
//               Load More
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Footer with stats */}
//       {chats.length > 0 && (
//         <div className='p-4 border-t border-gray-100 bg-gray-50'>
//           <div className='text-xs text-gray-500 text-center'>
//             {filteredChats.length} of {chats.length} design
//             {chats.length !== 1 ? "s" : ""}
//             {searchQuery && ` matching "${searchQuery}"`}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatSidebar;

"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import api, { Chat } from "@/utils/api.class";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Add this import
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, SquarePen, Trash2, MoreVertical, X } from "lucide-react";

type Props = {
  activeChatId?: string;
  onChatDeleted?: (chatId: string) => void;
  onNewChat?: (chatId: string) => void; // Added callback for new chat creation
};

const ChatSidebar: React.FC<Props> = ({
  activeChatId,
  onChatDeleted,
  onNewChat,
}) => {
  const router = useRouter(); // Add this hook
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Enhanced chat filtering with fuzzy search
  const filterChats = useCallback((chats: Chat[], query: string) => {
    if (!query.trim()) return chats;

    const searchTerms = query.toLowerCase().split(" ").filter(Boolean);

    return chats
      .filter((chat) => {
        // Get display title (from metadata.lastUserInput or fallback to title)
        const displayTitle =
          chat.metadata?.lastUserInput || chat.title || "Untitled chat";
        const title = displayTitle.toLowerCase();
        const content = chat.lastMessage?.toLowerCase() || "";
        const searchText = `${title} ${content}`;

        return searchTerms.every((term) => searchText.includes(term));
      })
      .sort((a, b) => {
        // Prioritize title matches over content matches
        const aTitle = (
          a.metadata?.lastUserInput ||
          a.title ||
          ""
        ).toLowerCase();
        const bTitle = (
          b.metadata?.lastUserInput ||
          b.title ||
          ""
        ).toLowerCase();
        const queryLower = query.toLowerCase();

        const aTitleMatch = aTitle.includes(queryLower);
        const bTitleMatch = bTitle.includes(queryLower);

        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;

        // Fall back to date sorting
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const filtered = filterChats(chats, searchQuery);
      setFilteredChats(filtered);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [chats, searchQuery, filterChats]);

  // Enhanced data fetching with caching and error recovery
  const fetchChats = useCallback(
    async (force = false) => {
      if (loading && !force) return;

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const res = await api.getAllChats();

        if (abortControllerRef.current.signal.aborted) return;

        // Enhanced filtering with better state management
        const validChats = res.data
          .filter(
            (chat) =>
              chat.state !== "intent" && chat.state !== "welcome" && chat.id // Ensure chat has valid ID
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

        setChats(validChats);
        setFilteredChats(filterChats(validChats, searchQuery));
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) return;

        // console.error("Failed to fetch chats:", err);
        setError("Failed to load chats");

        // Retry logic for network errors
        if (err.name === "NetworkError") {
          setTimeout(() => fetchChats(true), 2000);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [loading, searchQuery, filterChats]
  );

  // New chat creation handler
  const handleNewChat = useCallback(async () => {
    if (isCreatingNewChat) return;

    setIsCreatingNewChat(true);
    setError(null);

    try {
      const res = await api.startChat();

      if (res.status && res.data?.id) {
        // Refresh the chat list to include the new chat
        await fetchChats(true);

        // Notify parent component about the new chat
        onNewChat?.(res.data.id);

        // Navigate to the new chat (use router.push for SPA navigation)
        router.push(`/dashboard/aiagent/chat/${res.data.id}`);
      } else {
        throw new Error(
          res.message || "Failed to start chat - invalid response"
        );
      }
    } catch (err) {
      // console.error("Failed to create new chat:", err);
      setError("Failed to create new chat");
    } finally {
      setIsCreatingNewChat(false);
    }
  }, [isCreatingNewChat, fetchChats, onNewChat, router]); // Add router to deps

  // Delete chat functionality
  const handleDeleteChat = useCallback(
    async (chatId: string, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!confirm("Are you sure you want to delete this chat?")) return;

      setIsDeleting(chatId);

      try {
        // await api.deleteChat(chatId); // Uncomment when API is available

        // Optimistic update
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        setActionMenuOpen(null);
        onChatDeleted?.(chatId);

        // If deleting active chat, redirect to main chat page (use router.push)
        if (chatId === activeChatId) {
          router.push("/dashboard/aiagent/chat");
        }
      } catch (err) {
        // console.error("Failed to delete chat:", err);
        setError("Failed to delete chat");
      } finally {
        setIsDeleting(null);
      }
    },
    [activeChatId, onChatDeleted, router] // Add router to deps
  );

  // Function to refresh chats (can be called from parent)
  const refreshChats = useCallback(() => {
    fetchChats(true);
  }, [fetchChats]);

  // Expose refresh function to parent component
  useEffect(() => {
    if (window && typeof window !== "undefined") {
      (window as any).refreshChatSidebar = refreshChats;
    }
  }, [refreshChats]);

  // Initial load
  useEffect(() => {
    fetchChats();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Enhanced search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Utility function to get display title
  const getDisplayTitle = useCallback((chat: Chat) => {
    const lastUserInput = chat.metadata?.lastUserInput;
    if (lastUserInput && lastUserInput.trim()) {
      // Truncate to reasonable length for sidebar
      return lastUserInput.length > 50
        ? lastUserInput.substring(0, 50).trim() + "..."
        : lastUserInput;
    }
    return chat.title || "Untitled Chat";
  }, []);

  // Memoized chat items for performance
  const chatItems = useMemo(() => {
    return filteredChats.map((chat) => {
      const isActive = chat.id === activeChatId;
      const isBeingDeleted = isDeleting === chat.id;
      const displayTitle = getDisplayTitle(chat);

      return (
        <li key={chat.id} className='group relative'>
          <Link
            href={`/dashboard/aiagent/chat/${chat.id}`}
            className={`block px-3 py-2 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gray-50 border border-gray-200"
                : "hover:bg-gray-50 border border-transparent"
            } ${isBeingDeleted ? "opacity-50 pointer-events-none" : ""}`}>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium text-gray-900 truncate'>
                  {displayTitle}
                </div>

                <div className='text-xs text-gray-400 mt-1 flex items-center gap-2'>
                  <span>
                    {formatDistanceToNow(new Date(chat.updatedAt))} ago
                  </span>
                </div>
              </div>

              {/* Action menu */}
              <div className='relative opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActionMenuOpen(
                      actionMenuOpen === chat.id ? null : chat.id
                    );
                  }}
                  className='p-1 hover:bg-gray-200 rounded transition-colors duration-200 focus:outline-none'
                  aria-label='Chat actions'>
                  <MoreVertical size={14} />
                </button>

                {/* Dropdown menu */}
                {actionMenuOpen === chat.id && (
                  <div className='absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]'>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className='w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200'>
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Loading indicator for deleting chat */}
            {isBeingDeleted && (
              <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg'>
                <div className='w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin'></div>
              </div>
            )}
          </Link>
        </li>
      );
    });
  }, [
    filteredChats,
    activeChatId,
    isDeleting,
    actionMenuOpen,
    handleDeleteChat,
    getDisplayTitle,
  ]);

  // Click outside to close action menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuOpen) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [actionMenuOpen]);

  return (
    <div className='hidden md:flex flex-col border border-[#F2F2F2] h-[88vh] w-64 min-w-[256px] border-r overflow-hidden bg-white'>
      {/* Header */}
      <div className='p-4 border-b border-gray-100 bg-gray-50'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-sm font-medium text-gray-800'>Design History</h3>
          <button
            onClick={handleNewChat}
            disabled={isCreatingNewChat}
            className='text-sm text-gray-600 hover:text-gray-800 items-center flex gap-1.5 px-2 py-1 rounded-md bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'>
            {isCreatingNewChat ? (
              <>
                <div className='w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin'></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <SquarePen size={14} />
                New
              </>
            )}
          </button>
        </div>

        {/* Enhanced search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            type='text'
            placeholder='Search your designs...'
            value={searchQuery}
            onChange={handleSearchChange}
            className='pl-9 pr-8 text-sm'
            aria-label='Search previous chats'
          />

          {/* Clear search button */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none'
              aria-label='Clear search'>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Chat list */}
      <div className='flex-1 overflow-y-auto h-full p-2 pb-5 space-y-1'>
        {/* Error state with retry */}
        {error && (
          <div className='p-4 text-center space-y-3'>
            <p className='text-sm text-gray-400 italic'>
              Error loading history
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && chats.length === 0 && !error && (
          <div className='flex flex-col items-center justify-center h-64 text-center space-y-4 p-4'>
            <div className='text-4xl'>🎨</div>
            <div className='space-y-2'>
              <h4 className='font-medium text-gray-900'>No designs yet</h4>
              <p className='text-sm text-gray-500'>
                Start your first design conversation to see it here
              </p>
            </div>
            <button
              onClick={handleNewChat}
              disabled={isCreatingNewChat}
              className='text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
              {isCreatingNewChat ? "Creating..." : "Create First Design"}
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading &&
          searchQuery &&
          filteredChats.length === 0 &&
          chats.length > 0 && (
            <div className='text-center py-8 space-y-3'>
              <Search size={32} className='text-gray-300 mx-auto' />
              <div>
                <p className='text-sm text-gray-600'>No designs found</p>
                <p className='text-xs text-gray-400'>Try different keywords</p>
              </div>
              <button
                onClick={clearSearch}
                className='text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none'>
                Clear search
              </button>
            </div>
          )}

        {/* Chat list */}
        <ul className='space-y-[2px]'>{chatItems}</ul>

        {/* Load more button (if pagination is needed) */}
        {!loading && filteredChats.length >= 20 && (
          <div className='p-4 text-center'>
            <button
              onClick={() => fetchChats(true)}
              className='text-sm text-primary hover:text-gray-800 underline focus:outline-none'>
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {chats.length > 0 && (
        <div className='p-4 border-t border-gray-100 bg-gray-50'>
          <div className='text-xs text-gray-500 text-center'>
            {filteredChats.length} of {chats.length} design
            {chats.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
