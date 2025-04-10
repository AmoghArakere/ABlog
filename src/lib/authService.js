// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && window.localStorage;

// Safe localStorage getter
const getFromStorage = (key, defaultValue = null) => {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? item : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Safe localStorage setter
const setToStorage = (key, value) => {
  if (!isBrowser) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

// Authentication service that uses the API
const authService = {
  // Get the current user from localStorage
  getCurrentUser() {
    const userJson = getFromStorage('currentUser');
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing current user:', error);
      return null;
    }
  },

  // Update the current user in localStorage
  updateCurrentUser(user) {
    if (!user) return false;

    try {
      console.log('Updating current user in localStorage:', user);
      setToStorage('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error updating current user:', error);
      return false;
    }
  },

  // Get the current token from localStorage
  getToken() {
    return getFromStorage('token');
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      console.log(`Attempting to sign in with email: ${email}`);

      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('Sign in response:', data);

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to sign in' };
      }

      // Ensure the user object has all required fields
      if (!data.user.username) {
        console.error('User object is missing username:', data.user);
        return { success: false, error: 'Invalid user data received from server' };
      }

      console.log('Storing user in localStorage:', data.user);

      // Store the user and token in localStorage
      setToStorage('currentUser', JSON.stringify(data.user));
      setToStorage('token', data.token);

      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      console.log('Client signUp called with:', { email, userData });

      // Call the register API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          username: userData.username,
          full_name: userData.full_name || '',
          avatar_url: userData.avatar_url || '',
          cover_image: userData.cover_image || '',
          bio: userData.bio || '',
          website: userData.website || '',
          location: userData.location || ''
        })
      });

      const data = await response.json();
      console.log('Sign up response:', data);

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to sign up' };
      }

      // Make sure the user object has a username
      if (!data.user.username && userData.username) {
        data.user.username = userData.username;
      }

      console.log('Storing user in localStorage:', data.user);

      // Store the user and token in localStorage
      setToStorage('currentUser', JSON.stringify(data.user));
      setToStorage('token', data.token);

      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Sign out
  async signOut() {
    try {
      if (isBrowser) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Request password reset
  async resetPassword(email) {
    try {
      // Call the reset password API endpoint
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to reset password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Complete password reset
  async completePasswordReset(email, token, newPassword) {
    try {
      // Call the complete password reset API endpoint
      const response = await fetch('/api/auth/reset-password/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, token, password: newPassword })
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to complete password reset' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error completing password reset:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Update user profile
  async updateProfile(userId, userData) {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      // Call the update profile API endpoint
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }

      // Update the current user in localStorage
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        setToStorage('currentUser', JSON.stringify({ ...currentUser, ...userData }));
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};

export default authService;
