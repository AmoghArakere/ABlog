import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../lib/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Login with email and password
  const signIn = async (email, password) => {
    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    try {
      const result = await authService.signUp(email, password, metadata);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Request password reset
  const resetPassword = async (email) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Complete password reset
  const completePasswordReset = async (email, token, newPassword) => {
    try {
      return await authService.completePasswordReset(email, token, newPassword);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      if (!user) return { success: false, error: 'Not logged in' };

      const result = await authService.updateProfile(user.id, data);
      if (result.success) {
        // Update the user state with the new data
        setUser({ ...user, ...data });
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    completePasswordReset,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
