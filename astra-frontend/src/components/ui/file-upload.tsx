import React, { useRef, useState, useCallback } from "react";
import { Upload, X, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept: string;
  error?: string;
  disabled?: boolean;
  maxSize?: number; // in bytes
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept,
  error,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
      }

      // Check file type
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });

      if (!isValidType) {
        return "File type not supported";
      }

      return null;
    },
    [accept, maxSize]
  );

  const handleFileSelection = useCallback(
    (file: File) => {
      const validation = validateFile(file);

      if (validation) {
        setValidationError(validation);
        setSelectedFile(null);
        onFileSelect(null);
        return;
      }

      setValidationError("");
      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValidationError("");
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const displayError = error || validationError;

  return (
    <div className='space-y-2'>
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
              : dragOver
                ? "border-black bg-gray-50 scale-[1.02]"
                : displayError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-gray-400 cursor-pointer"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}>
          <div className='flex flex-col items-center space-y-3'>
            {displayError ? (
              <AlertCircle className='h-8 w-8 text-red-400' />
            ) : (
              <Upload
                className={`h-8 w-8 ${disabled ? "text-gray-300" : "text-gray-400"}`}
              />
            )}
            <div>
              <p
                className={`text-sm font-medium ${disabled ? "text-gray-400" : displayError ? "text-red-600" : "text-gray-700"}`}>
                {displayError
                  ? "Upload Failed"
                  : "Drag and drop your file here"}
              </p>
              <p
                className={`text-xs ${disabled ? "text-gray-400" : displayError ? "text-red-500" : "text-gray-500"}`}>
                or click to browse (
                {accept.replace(/image\//g, "").toUpperCase()})
              </p>
            </div>
            {!disabled && (
              <button
                type='button'
                className={`text-sm px-4 py-2 rounded-full transition-colors ${
                  displayError
                    ? "text-red-600 bg-red-100 hover:bg-red-200"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}>
                {displayError ? "Try Again" : "Browse Files"}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type='file'
            accept={accept}
            onChange={handleFileInputChange}
            className='absolute inset-0 opacity-0 cursor-pointer'
            disabled={disabled}
          />
        </div>
      ) : (
        <div className='flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
              <Upload className='h-5 w-5 text-green-600' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-green-900 truncate'>
                {selectedFile.name}
              </p>
              <p className='text-xs text-green-700'>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {selectedFile.type}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              type='button'
              onClick={removeFile}
              className='text-green-600 hover:text-green-800 hover:bg-green-100 p-1 rounded transition-colors'
              title='Remove file'>
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
      )}

      {displayError && (
        <div className='flex items-start space-x-2'>
          <AlertCircle className='h-4 w-4 text-red-500 mt-0.5 flex-shrink-0' />
          <p className='text-sm text-red-600'>{displayError}</p>
        </div>
      )}
    </div>
  );
};
