import React from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import ClientUserProfile from './ClientUserProfile';

export default function ClientUserProfileWrapper({ username, isCurrentUser = false }) {
  console.log('ClientUserProfileWrapper received username:', username);

  // If no username is provided, show an error message
  if (!username) {
    return (
      <ToastProvider>
        <div className="text-center py-12">
          <div className="bg-red-50 text-red-500 p-6 rounded-lg inline-block">
            <p className="text-xl font-semibold">Error: No username provided</p>
            <p className="mt-2">Please try logging in again.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <ClientUserProfile username={username} isCurrentUser={isCurrentUser} />
    </ToastProvider>
  );
}
