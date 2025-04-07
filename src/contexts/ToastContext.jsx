import React, { createContext, useContext } from 'react';
import { Toast, ToastContainer, useToast } from '../components/ui/toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, toast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            variant={t.variant}
            duration={t.duration}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
