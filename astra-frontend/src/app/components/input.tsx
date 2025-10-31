"use client"
import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import Notification from './notification';

interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  showCopyButton?: boolean;
  error?: string;
  label?: string;
  autoComplete?: string;
}

function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  id,
  className = '',
  required = false,
  disabled = false,
  showPasswordToggle = false,
  showCopyButton = false,
  error,
  label,
  autoComplete,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          id={id}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-[436px] h-14 rounded-full py-4 px-6 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : ''
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${
            (showPasswordToggle || showCopyButton) ? 'pr-16' : ''
          } ${className}`}
        />
        <div className="absolute right-4 top-4 flex gap-2">
          {showCopyButton && (
            <button
              type="button"
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Copy to clipboard"
              disabled={!value}
            >
              {isCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
          )}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default Input;