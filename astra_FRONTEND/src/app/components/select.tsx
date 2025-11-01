"use client"
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Select Component
export interface SelectOption {
    value: string;
    label: string;
  }
  
  interface SelectProps {
    options: SelectOption[];
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    name?: string;
    id?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    label?: string;
  }
  
  function Select({
    options,
    placeholder,
    value,
    onChange,
    onBlur,
    id,
    className = '',
    required = false,
    disabled = false,
    error,
    label,
  }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption | undefined>(
      value ? options.find(option => option.value === value) : undefined
    );
  
    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };
  
    const handleSelect = (option: SelectOption) => {
      setSelectedOption(option);
      setIsOpen(false);
      if (onChange) {
        onChange(option.value);
      }
    };
  
    const handleBlur = () => {
      setTimeout(() => {
        setIsOpen(false);
        if (onBlur) {
          onBlur();
        }
      }, 200);
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
          <div
            className={`w-[436px] h-14 rounded-full py-4 px-6 border border-gray-300 outline-none flex items-center justify-between cursor-pointer ${
              isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''
            } ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
            onClick={toggleDropdown}
            onBlur={handleBlur}
            tabIndex={0}
            id={id}
          >
            <span className={`${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
              {selectedOption ? selectedOption.label : placeholder || 'Select an option'}
            </span>
            <div className="text-gray-500">
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`px-6 py-3 cursor-pointer hover:bg-gray-100 ${
                    selectedOption?.value === option.value ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
  
  export {  Select };