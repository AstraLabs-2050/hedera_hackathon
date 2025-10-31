"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import Markdown from "react-markdown";
import {
  Copy,
  Volume2,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
} from "lucide-react";
import Image from "next/image";

type Attachment = {
  type: string;
  url?: string;
  fallback?: string;
  image_url?: string;
  thumb_url?: string;
};

type Props = {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  isOptimistic?: boolean;
  onReaction?: (reaction: string) => void;
};

const MessageBubble: React.FC<Props> = ({
  role,
  content,
  attachments,
  isOptimistic = false,
  onReaction,
}) => {
  const isUser = role === "user";
  const [activeIcons, setActiveIcons] = useState({
    copy: false,
    like: false,
    dislike: false,
  });
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const bubbleRef = useRef<HTMLDivElement>(null);

  // Enhanced regex patterns
  const IMAGE_URL_REGEX =
    /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(\?.*)?)/gi;
  const BASE64_IMAGE_REGEX = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        action();
      }
    },
    []
  );

  // Enhanced copy functionality with feedback
  const handleCopyClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setActiveIcons((prev) => ({ ...prev, copy: true }));

      // Show success feedback
      const notification = document.createElement("div");
      notification.textContent = "Copied to clipboard!";
      notification.className =
        "fixed top-4 right-4 bg-green-100 text-green-400 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);

      setTimeout(() => {
        setActiveIcons((prev) => ({ ...prev, copy: false }));
      }, 3000);
    } catch (err) {
      // console.error("Failed to copy:", err);
      setActiveIcons((prev) => ({ ...prev, copy: false }));
    }
  }, [content]);

  // Enhanced image download
  const handleDownloadImage = useCallback(
    async (imageUrl: string, fileName?: string) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || `design-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        // console.error("Download failed:", err);
      }
    },
    []
  );

  // Image error handling
  const handleImageError = useCallback((imageUrl: string) => {
    setImageLoadErrors((prev) => new Set([...prev, imageUrl]));
  }, []);

  // Process content and extract images
  const { processedContent, imageUrls, isBase64Image } = useMemo(() => {
    const attachmentImages =
      attachments?.filter(
        (att) => att.type === "image" && (att.url || att.image_url)
      ) || [];

    const extractedUrls =
      attachmentImages.length === 0
        ? Array.from(content.matchAll(IMAGE_URL_REGEX)).map((m) => m[0])
        : [];

    const isBase64 = BASE64_IMAGE_REGEX.test(content.trim());

    let processedText = content;

    // Remove image URLs from text content if no attachments
    if (attachmentImages.length === 0 && extractedUrls.length > 0) {
      extractedUrls.forEach((url) => {
        processedText = processedText.replace(url, "").trim();
      });
    }

    if (isBase64) processedText = "";

    // Enhanced text processing
    const cleanedText = processedText
      .split("\n")
      .filter((line) => !/^\*\*Variation \d+\*\*:.*/i.test(line.trim()))
      .join("\n")
      .trim();

    return {
      processedContent: cleanedText,
      imageUrls: extractedUrls,
      isBase64Image: isBase64,
    };
  }, [content, attachments]);

  // Get all images for rendering
  const allImages = useMemo(() => {
    const attachmentImages =
      attachments?.filter(
        (att) => att.type === "image" && (att.url || att.image_url)
      ) || [];

    if (attachmentImages.length > 0) {
      return attachmentImages.map((att, i) => ({
        src: att.thumb_url || att.image_url || att.url || "",
        fullSrc: att.image_url || att.url || "",
        alt: att.fallback || `Design ${i + 1}`,
        type: "attachment" as const,
      }));
    }

    if (isBase64Image) {
      return [
        {
          src: content,
          fullSrc: content,
          alt: "Generated design",
          type: "base64" as const,
        },
      ];
    }

    if (imageUrls.length > 0) {
      return imageUrls.map((url, i) => ({
        src: url,
        fullSrc: url,
        alt: `Generated design ${i + 1}`,
        type: "url" as const,
      }));
    }

    return [];
  }, [attachments, isBase64Image, content, imageUrls]);

  // Enhanced image grid rendering
  const renderImageGrid = useCallback(() => {
    if (allImages.length === 0) return null;

    const gridClass =
      allImages.length === 1
        ? "grid grid-cols-1"
        : allImages.length === 2
          ? "grid grid-cols-2 gap-3"
          : "grid grid-cols-2 md:grid-cols-3 gap-3";

    return (
      <div className={`${gridClass} max-w-full mb-3`}>
        {allImages.map((img, i) => {
          const hasError = imageLoadErrors.has(img.src);

          return (
            <div
              key={`${img.src}-${i}`}
              className='relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-100 hover:border-gray-300 transition-all duration-200'
              onClick={() => openPreview(i)}>
              {/* Image container */}
              <div className='aspect-square relative'>
                {!hasError ? (
                  <img
                    src={img.src}
                    alt={img.alt}
                    className='w-full h-full object-cover transition-transform duration-200 group-hover:scale-105'
                    loading='lazy'
                    onError={() => handleImageError(img.src)}
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gray-200'>
                    <div className='text-center space-y-1'>
                      <div className='text-2xl'>🖼️</div>
                      <p className='text-xs text-gray-500'>Failed to load</p>
                    </div>
                  </div>
                )}

                {/* Loading overlay for optimistic images */}
                {isOptimistic && (
                  <div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center'>
                    <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  </div>
                )}

                {/* Hover overlay with actions */}
                <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100'></div>
              </div>

              {/* Variation label for AI responses */}
              {role === "assistant" && allImages.length > 1 && (
                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs px-2 py-1'>
                  <span className='bg-black bg-opacity-50 px-2 py-1 rounded'>
                    Variation {i + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [
    allImages,
    imageLoadErrors,
    isOptimistic,
    role,
    handleImageError,
    handleDownloadImage,
  ]);

  // Modal navigation
  const openPreview = useCallback((index: number) => {
    setPreviewIndex(index);
    document.body.style.overflow = "hidden"; // Prevent background scroll
  }, []);

  const closePreview = useCallback(() => {
    setPreviewIndex(null);
    document.body.style.overflow = "unset";
  }, []);

  const navigatePreview = useCallback(
    (direction: "prev" | "next") => {
      if (previewIndex === null || allImages.length <= 1) return;

      setPreviewIndex((prev) => {
        if (prev === null) return 0;

        if (direction === "prev") {
          return prev === 0 ? allImages.length - 1 : prev - 1;
        } else {
          return prev === allImages.length - 1 ? 0 : prev + 1;
        }
      });
    },
    [previewIndex, allImages.length]
  );

  // Keyboard navigation for modal
  useEffect(() => {
    if (previewIndex === null) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closePreview();
          break;
        case "ArrowLeft":
          navigatePreview("prev");
          break;
        case "ArrowRight":
          navigatePreview("next");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [previewIndex, closePreview, navigatePreview]);

  // Enhanced reaction handling
  const handleReaction = useCallback(
    (reaction: string) => {
      setActiveIcons((prev) => ({
        ...prev,
        [reaction]: !prev[reaction as keyof typeof prev],
      }));
      onReaction?.(reaction);
    },
    [onReaction]
  );

  // Text-to-speech (placeholder for future implementation)
  const handleTextToSpeech = useCallback(() => {
    // Future implementation
    // console.log("Text-to-speech not yet implemented");
  }, []);

  // Enhanced markdown components
  const markdownComponents = useMemo(
    () => ({
      p: ({ children }) => <p className='-mb-5 last:mb-0'>{children}</p>,
      ul: ({ children }) => <ul className='list-disc pl-5'>{children}</ul>,
      ol: ({ children }) => <ol className='list-decimal pl-5'>{children}</ol>,
      li: ({ children }) => (
        <li className='leading-relaxed -mb-5'>{children}</li>
      ),
      strong: ({ children }) => (
        <strong className='font-semibold'>{children}</strong>
      ),
      em: ({ children }) => <em className='italic'>{children}</em>,
      code: ({ children }) => (
        <code className='bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono'>
          {children}
        </code>
      ),
      pre: ({ children }: any) => (
        <pre className='bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm font-mono mb-2'>
          {children}
        </pre>
      ),
    }),
    []
  );

  return (
    <>
      <div
        ref={bubbleRef}
        className={`md:max-w-[70%] group ${
          isUser
            ? "ml-auto flex items-end justify-end max-w-[80%]"
            : "mr-auto flex items-start space-x-[5px] max-w-[90%] md:space-x-3"
        }`}>
        {/* Assistant avatar */}
        {!isUser && (
          <div className='flex-shrink-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center'>
            <Image
              src='/agent.svg'
              alt='AI Agent'
              width={20}
              height={20}
              priority
              className='w-5 h-auto'
            />
          </div>
        )}

        {/* Message content */}
        <div
          className={`inline-block text-[15px] rounded-2xl whitespace-pre-wrap relative ${
            isUser
              ? "bg-primary text-white px-4 py-3 max-w-md"
              : "bg-white border border-gray-200 px-4 py-3 shadow-sm"
          } ${isOptimistic ? "opacity-70" : ""}`}>
          {/* Optimistic indicator */}
          {isOptimistic && (
            <div className='absolute top-2 right-2'>
              <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
            </div>
          )}

          {/* Text content */}
          {processedContent && (
            <div
              className={`leading-relaxed ${
                processedContent.length > 500 && !isExpanded
                  ? "line-clamp-6"
                  : ""
              }`}>
              <Markdown components={markdownComponents}>
                {processedContent}
              </Markdown>

              {/* Expand/collapse for long content */}
              {processedContent.length > 500 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className='text-sm text-blue-600 hover:text-blue-800 mt-2 underline focus:outline-none'>
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {/* Enhanced image rendering */}
          {renderImageGrid()}

          {/* Assistant message actions */}
          {!isUser && !isOptimistic && (
            <div className='flex items-center gap-3 mt-3 pt-2 border-t border-gray-100'>
              {/* Copy button */}
              <button
                onClick={handleCopyClick}
                onKeyDown={(e) => handleKeyDown(e, handleCopyClick)}
                className='flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1'
                aria-label='Copy message'>
                <Copy
                  size={14}
                  className={activeIcons.copy ? "text-blue-500" : ""}
                />
                <span>{activeIcons.copy ? "Copied!" : "Copy"}</span>
              </button>

              {/* Text-to-speech placeholder */}
              <button
                onClick={handleTextToSpeech}
                className='flex items-center gap-1 text-xs text-gray-400 cursor-not-allowed'
                disabled
                aria-label='Text-to-speech (coming soon)'>
                <Volume2 size={14} />
                <span>Listen</span>
              </button>

              {/* Reaction buttons */}
              <div className='flex gap-1 ml-auto'>
                <button
                  onClick={() => handleReaction("like")}
                  className={`p-1 rounded transition-colors duration-200 focus:outline-none ${
                    activeIcons.like
                      ? "text-red-500 bg-red-50"
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                  aria-label='Like this response'>
                  <Heart
                    size={14}
                    fill={activeIcons.like ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        {/* {isUser && (
          <div className='flex-shrink-0 bg-black rounded-full w-8 h-8 flex items-center justify-center'>
            <Image
              src='/logo.svg'
              width={16}
              height={8}
              alt='User avatar'
              priority
            />
          </div>
        )} */}
      </div>

      {/* Enhanced image preview modal */}
      {previewIndex !== null && allImages[previewIndex] && (
        <div
          className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4'
          onClick={closePreview}>
          {/* Image container */}
          <div className='relative max-w-[95vw] max-h-[95vh] flex items-center justify-center'>
            <img
              src={allImages[previewIndex].fullSrc}
              alt={allImages[previewIndex].alt}
              className='max-w-full max-h-[600px] rounded-lg shadow-2xl object-contain'
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image actions overlay */}
            <div className='absolute top-4 right-4 flex gap-2'>
              <button
                onClick={closePreview}
                className='p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black'
                aria-label='Close preview'>
                <X size={18} />
              </button>
            </div>

            {/* Navigation arrows for multiple images */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePreview("prev");
                  }}
                  className='absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black'
                  aria-label='Previous image'>
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePreview("next");
                  }}
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black'
                  aria-label='Next image'>
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Image counter */}
            {allImages.length > 1 && (
              <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm'>
                {previewIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;
