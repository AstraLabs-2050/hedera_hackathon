"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Paperclip, Send, X, Image as ImageIcon, Loader2 } from "lucide-react";

type Props = {
  onSend: (content: string, files?: File[]) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
};

const MessageInput: React.FC<Props> = ({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = "Send a message...",
}) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Map<File, string>>(new Map());

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dragCounterRef = useRef(0);

  // Configuration
  const MAX_FILES = 4;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only image files are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large (max 10MB)`;
    }
    return null;
  }, []);

  // Cleanup preview URLs
  const cleanupPreviewUrls = useCallback(() => {
    setPreviewUrls((prev) => {
      prev.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      return new Map();
    });
  }, []);

  // Handle file selection with enhanced validation
  const handleFileSelection = useCallback(
    (files: File[]) => {
      const errors: string[] = [];
      const validFiles: File[] = [];
      const newPreviewUrls = new Map<File, string>();

      // Check total file count
      if (selectedFiles.length + files.length > MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        files = files.slice(0, MAX_FILES - selectedFiles.length);
      }

      // Validate each file
      files.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          // Check for duplicates
          const isDuplicate = selectedFiles.some(
            (existing) =>
              existing.name === file.name && existing.size === file.size
          );

          if (!isDuplicate) {
            validFiles.push(file);
            // Create preview URL
            try {
              const url = URL.createObjectURL(file);
              newPreviewUrls.set(file, url);
            } catch (e) {
              // console.warn(`Failed to create preview for ${file.name}:`, e);
            }
          } else {
            errors.push(`${file.name}: File already selected`);
          }
        }
      });

      // Update state
      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setPreviewUrls((prev) => new Map([...prev, ...newPreviewUrls]));
      }

      if (errors.length > 0) {
        setFileErrors(errors);
        // Clear errors after 5 seconds
        setTimeout(() => setFileErrors([]), 5000);
      }
    },
    [selectedFiles, validateFile]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const filesArray = Array.from(e.target.files);
      handleFileSelection(filesArray);
      // Reset input value for re-selection
      e.target.value = "";
    },
    [handleFileSelection]
  );

  // Remove selected file
  const removeFile = useCallback(
    (index: number) => {
      const fileToRemove = selectedFiles[index];
      const newFiles = selectedFiles.filter((_, i) => i !== index);

      setSelectedFiles(newFiles);

      // Cleanup preview URL
      const url = previewUrls.get(fileToRemove);
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore cleanup errors
        }
        const newPreviewUrls = new Map(previewUrls);
        newPreviewUrls.delete(fileToRemove);
        setPreviewUrls(newPreviewUrls);
      }
    },
    [selectedFiles, previewUrls]
  );

  // Enhanced drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounterRef.current = 0;

      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        const filesArray = Array.from(files).filter((file) =>
          file.type.startsWith("image/")
        );
        if (filesArray.length > 0) {
          handleFileSelection(filesArray);
        }
      }
    },
    [handleFileSelection]
  );

  // Trigger file input
  const handleAttach = useCallback(() => {
    if (disabled || isLoading) return;
    fileInputRef.current?.click();
  }, [disabled, isLoading]);

  // Enhanced send functionality
  const handleSend = useCallback(async () => {
    if (isLoading || disabled) return;

    const trimmedMessage = message.trim();
    if (trimmedMessage === "" && selectedFiles.length === 0) return;

    try {
      await onSend(trimmedMessage, selectedFiles);
      // Clear form on successful send
      setMessage("");
      setSelectedFiles([]);
      cleanupPreviewUrls();
      setFileErrors([]);

      // Focus back to textarea
      textareaRef.current?.focus();
    } catch (error) {
      // Error is handled upstream
      // console.error("Send failed:", error);
    }
  }, [message, selectedFiles, onSend, isLoading, disabled, cleanupPreviewUrls]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }

      // Escape to clear files/message
      if (e.key === "Escape") {
        if (selectedFiles.length > 0) {
          setSelectedFiles([]);
          cleanupPreviewUrls();
        } else if (message.trim()) {
          setMessage("");
        }
      }
    },
    [handleSend, selectedFiles.length, message, cleanupPreviewUrls]
  );

  // Auto-resize and focus management
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPreviewUrls();
    };
  }, [cleanupPreviewUrls]);

  // Memoized button states
  const canSend = useMemo(() => {
    return (
      (message.trim() !== "" || selectedFiles.length > 0) &&
      !disabled &&
      !isLoading
    );
  }, [message, selectedFiles.length, disabled, isLoading]);

  const buttonClasses = useMemo(() => {
    return `rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      canSend
        ? "bg-black text-white hover:bg-gray-800 focus:ring-gray-500 cursor-pointer"
        : "bg-gray-100 text-gray-500 cursor-not-allowed"
    }`;
  }, [canSend]);

  return (
    <div
      className={`p-4 border shadow-sm transition-all duration-200 bg-white w-full max-w-4xl rounded-2xl mb-5 ${
        isDragOver
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      {/* Error display */}
      {fileErrors.length > 0 && (
        <div className='mb-3 p-2 bg-red-50 border border-red-200 rounded-md'>
          {fileErrors.map((error, index) => (
            <p key={index} className='text-sm text-red-600'>
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Drag overlay */}
      {isDragOver && (
        <div className='absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-blue-400 border-dashed rounded-2xl flex items-center justify-center z-10'>
          <div className='text-center space-y-2'>
            <ImageIcon size={48} className='text-blue-500 mx-auto' />
            <p className='text-blue-600 font-medium'>Drop images here</p>
            <p className='text-sm text-blue-500'>
              Up to {MAX_FILES} files, max 10MB each
            </p>
          </div>
        </div>
      )}

      <div className='flex flex-col gap-3'>
        {/* File previews */}
        {selectedFiles.length > 0 && (
          <div className='flex gap-2 overflow-x-auto pb-2'>
            {selectedFiles.map((file, i) => {
              const url = previewUrls.get(file);
              return (
                <div
                  key={`${file.name}-${i}`}
                  className='relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100'>
                  {url ? (
                    <img
                      src={url}
                      alt={file.name}
                      className='w-full h-full object-cover'
                      loading='lazy'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <ImageIcon size={16} className='text-gray-400' />
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(i)}
                    type='button'
                    className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1'
                    aria-label={`Remove ${file.name}`}>
                    <X size={12} />
                  </button>

                  {/* File info tooltip */}
                  <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate'>
                    {file.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Input area */}
        <div className='flex items-end gap-3'>
          {/* Textarea */}
          <div className='flex-1 relative'>
            <TextareaAutosize
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={1}
              maxRows={6}
              placeholder={placeholder}
              className='w-full resize-none bg-transparent outline-none text-base text-gray-800 rounded-lg p-3 leading-6 max-h-[200px] overflow-y-auto focus:border-none transition-colors duration-200 placeholder:text-gray-400'
              disabled={disabled || isLoading}
              aria-label='Type your message'
              spellCheck={true}
            />

            {/* Character counter for long messages */}
            {message.length > 1000 && (
              <div className='absolute bottom-1 right-1 text-xs text-gray-400 bg-white px-1 rounded'>
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className='flex gap-2'>
            {/* Attach button */}
            <button
              onClick={handleAttach}
              type='button'
              className='rounded-full p-3 border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
              disabled={
                disabled || isLoading || selectedFiles.length >= MAX_FILES
              }
              aria-label='Attach images'
              title={
                selectedFiles.length >= MAX_FILES
                  ? `Maximum ${MAX_FILES} files allowed`
                  : "Attach images"
              }>
              <Paperclip size={18} />
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              type='button'
              className={buttonClasses}
              disabled={!canSend}
              aria-label='Send message'>
              {isLoading ? (
                <Loader2 size={18} className='animate-spin' />
              ) : (
                <Send size={18} />
              )}
              <span className='hidden sm:inline'>
                {isLoading ? "Sending..." : "Send"}
              </span>
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className='hidden'
          disabled={disabled || isLoading}
        />

        {/* File upload info */}
        {selectedFiles.length > 0 && (
          <div className='text-xs text-gray-500 flex items-center justify-between'>
            <span>
              {selectedFiles.length}/{MAX_FILES} files selected
            </span>
            <button
              onClick={() => {
                setSelectedFiles([]);
                cleanupPreviewUrls();
              }}
              className='text-red-500 hover:text-red-700 underline focus:outline-none'
              type='button'>
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
