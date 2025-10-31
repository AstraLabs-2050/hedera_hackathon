"use client"
import React from 'react'

interface TypingIndicatorProps {
  userName: string
}

function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 p-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-gray-600">
          {userName.charAt(0)}
        </span>
      </div>
      <div className="bg-[#F5F5F5] rounded-2xl rounded-bl-md p-3">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
