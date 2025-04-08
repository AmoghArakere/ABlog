import React, { useState, useEffect } from 'react';
import authService from '../lib/authService';
import ClientUserProfileWrapper from './ClientUserProfileWrapper';

export default function CurrentUserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const user = authService.getCurrentUser();
        console.log('Current user from auth service:', user);

        if (!user) {
          setError('You must be logged in to view your profile');
          setLoading(false);
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }

        if (!user.username) {
          console.error('User has no username:', user);
          setError('Your profile is missing a username. Please contact support.');
          setLoading(false);
          return;
        }

        console.log('Setting current user with username:', user.username);
        setCurrentUser(user);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg inline-block">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">You will be redirected to the login page.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <ClientUserProfileWrapper username={currentUser.username} isCurrentUser={true} />;
}
