"use client"
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Notification from './notification';

// Textarea Component
interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showCopyButton?: boolean;
  error?: string;
  label?: string;
  rows?: number;
  maxLength?: number;
}

function Textarea({
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  id,
  className = '',
  required = false,
  disabled = false,
  showCopyButton = false,
  error,
  label,
  rows = 4,
  maxLength,
}: TextareaProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    if (value) {
      navigator.clipboard.writeText(value)
        .then(() => {
          Notification.info('Copied to clipboard!');
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        })
        .catch((err) => {
          Notification.error('Failed to copy text');
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={id} className="mb-2 text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          id={id}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`w-[436px] rounded-3xl py-4 px-6 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : ''
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${
            showCopyButton ? 'pr-16' : ''
          } ${className}`}
        />
        {showCopyButton && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Copy to clipboard"
            disabled={!value}
          >
            {isCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default Textarea;