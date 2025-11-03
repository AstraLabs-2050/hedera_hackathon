"use client";
import React from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  width?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

function Button({
  label,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  width,
  className = '',
  icon,
  iconPosition = 'left'
}: ButtonProps) {
  // Base styles
  const baseStyles = 'rounded-full flex items-center justify-center font-semibold transition-all duration-200';
  
  // Size styles
  const sizeStyles = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-14 px-6 text-base',
    lg: 'h-16 px-8 text-lg',
  };
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300',
    outline: 'bg-transparent border border-black text-black hover:bg-gray-100',
    ghost: 'bg-transparent text-black hover:bg-gray-100',
  };
  
  // Width styles
  const widthStyles = width ? width : fullWidth ? 'w-full' : 'w-[436px]';
  
  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Icon spacing
  const iconSpacing = icon ? (iconPosition === 'left' ? 'space-x-2' : 'space-x-reverse space-x-2') : '';

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    } else if (!disabled) {
      console.log("Button clicked");
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${width} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${iconSpacing} ${className}`}
      onClick={handleClick}
      style={{ fontFamily: 'ClashGrotesk-Bold' }}
    >
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      <span>{label}</span>
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
}

export default Button;