import React, { useEffect, useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { initializeSampleData } from '../lib/sampleData';
import authService from '../lib/authService';

export default function App({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize sample data when the app loads
    if (!initialized) {
      initializeSampleData();
      setInitialized(true);
    }
  }, [initialized]);

  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
