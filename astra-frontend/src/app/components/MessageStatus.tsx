"use client";
interface MessageStatusProps {
  status: "sending" | "sent" | "delivered" | "read";
  timestamp: Date;
}

function MessageStatus({ status, timestamp }: MessageStatusProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusIcon = () => {
    switch (status) {
      case "sending":
        return "⏳";
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "sending":
        return "text-gray-400";
      case "sent":
        return "text-gray-500";
      case "delivered":
        return "text-blue-500";
      case "read":
        return "text-green-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className='flex items-center gap-1 text-xs'>
      <span className='text-gray-500'>{formatTime(timestamp)}</span>
      <span className={`${getStatusColor()}`}>{getStatusIcon()}</span>
    </div>
  );
}

export default MessageStatus;
