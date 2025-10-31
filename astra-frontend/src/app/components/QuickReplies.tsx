"use client"
import React from 'react'

interface QuickRepliesProps {
  onSelectReply: (reply: string) => void
  isVisible: boolean
}

function QuickReplies({ onSelectReply, isVisible }: QuickRepliesProps) {
  const quickReplies = [
    "Thank you for reaching out! I'll help you with that.",
    "I understand your concern. Let me look into this for you.",
    "Can you provide more details about the issue you're experiencing?",
    "I've escalated this to our technical team. You'll hear back within 24 hours.",
    "Your issue has been resolved. Please let me know if you need anything else.",
    "Thank you for your patience while we worked on this.",
    "Is there anything else I can help you with today?",
    "I'll need to check with our development team and get back to you.",
  ]

  if (!isVisible) return null

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#E5E5E5] rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Replies</h4>
      <div className="space-y-1">
        {quickReplies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onSelectReply(reply)}
            className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickReplies
