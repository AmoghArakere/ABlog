import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export const Toast = ({
  message,
  variant = 'default',
  duration = 3000,
  onClose,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300); // Allow animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300); // Allow animation to complete
  };

  const variantClasses = {
    default: 'bg-black text-white border-gray-700',
    success: 'bg-black text-white border-purple-600',
    error: 'bg-black text-red-500 border-red-600',
    warning: 'bg-black text-amber-400 border-amber-500',
  };

  return (
    <div
      className={cn(
        'fixed top-16 left-0 right-0 mx-auto w-full max-w-screen-md z-50 flex items-center justify-between px-6 py-3 shadow-lg transition-all duration-300 border-b',
        variantClasses[variant],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-1">
        <div className="font-medium">{message}</div>
      </div>
      <button
        onClick={handleClose}
        className="text-white hover:text-gray-200 focus:outline-none ml-4 pointer-events-auto"
        aria-label="Close"
      >
        <span className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded-md">OK</span>
      </button>
    </div>
  );
};

export const ToastContainer = ({ children }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
      {children}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, ...options }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    show: (message, options) => addToast(message, options),
    success: (message, options) => addToast(message, { variant: 'success', ...options }),
    error: (message, options) => addToast(message, { variant: 'error', ...options }),
    warning: (message, options) => addToast(message, { variant: 'warning', ...options }),
    remove: removeToast,
  };

  return { toasts, toast, removeToast };
};
