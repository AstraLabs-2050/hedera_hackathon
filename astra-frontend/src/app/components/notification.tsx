import React from "react";
import { toast, Toaster } from "react-hot-toast";

// Define types
type ToastType = "error" | "success" | "info";

interface ToastContentProps {
  message: string;
  type: ToastType;
}

// Toast notification component
const ToastContent: React.FC<ToastContentProps> = ({ message, type }) => {
  return (
    <div
      className={`px-4 py-3 rounded-md shadow-md flex items-center ${
        type === "error"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}>
      {type === "error" ? (
        <svg
          className='w-5 h-5 mr-2'
          fill='currentColor'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
            clipRule='evenodd'
          />
        </svg>
      ) : (
        <svg
          className='w-5 h-5 mr-2'
          fill='currentColor'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
            clipRule='evenodd'
          />
        </svg>
      )}
      <p className='text-sm font-medium'>{message}</p>
    </div>
  );
};

// Define the notification interface
interface NotificationInterface {
  ToastContainer: () => any;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// Main notification service
const Notification: NotificationInterface = {
  // For use in components
  ToastContainer: () => <Toaster position='top-center' reverseOrder={false} />,

  // Success notification
  success: (message: string) => {
    toast.custom(() => <ToastContent message={message} type='success' />, {
      duration: 3000,
    });
  },

  // Error notification
  error: (message: string) => {
    toast.custom(() => <ToastContent message={message} type='error' />, {
      duration: 4000,
    });
  },

  // Info notification
  info: (message: string) => {
    toast.custom(() => <ToastContent message={message} type='info' />, {
      duration: 3000,
    });
  },
};

export default Notification;
