import React, { createContext, useState, useEffect, useContext } from 'react';

const ApiAuthContext = createContext();

export function ApiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        // Token is invalid or expired
        localStorage.removeItem('token');
        setToken(null);
        setError(data.error);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to authenticate user');
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear user data and token
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiAuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        updateProfile
      }}
    >
      {children}
    </ApiAuthContext.Provider>
  );
}

export function useApiAuth() {
  return useContext(ApiAuthContext);
}
