import React from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import ClientUserProfile from './ClientUserProfile';

export default function ClientUserProfileWrapper({ username, isCurrentUser = false }) {
  return (
    <ToastProvider>
      <ClientUserProfile username={username} isCurrentUser={isCurrentUser} />
    </ToastProvider>
  );
}
