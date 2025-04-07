import emailService from './emailService';

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && window.localStorage;

// Safe localStorage getter
const getFromStorage = (key, defaultValue = '[]') => {
  if (!isBrowser) return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
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

// Simple authentication service using localStorage
const authService = {
  // Get the current user
  getCurrentUser() {
    const userJson = getFromStorage('currentUser', null);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const users = JSON.parse(getFromStorage('users'));
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Don't store the password in the current user
      const { password: _, ...userWithoutPassword } = user;

      // Store the current user in localStorage
      setToStorage('currentUser', JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const users = JSON.parse(getFromStorage('users'));

      // Check if email already exists
      if (users.some(u => u.email === email)) {
        return { success: false, error: 'Email already in use' };
      }

      // Check if username already exists
      if (userData.username && users.some(u => u.username === userData.username)) {
        return { success: false, error: 'Username already in use' };
      }

      // Create new user
      const newUser = {
        id: generateId(),
        email,
        password,
        username: userData.username || email.split('@')[0],
        full_name: userData.full_name || '',
        avatar_url: userData.avatar_url || '',
        cover_image: userData.cover_image || '',
        bio: userData.bio || '',
        website: userData.website || '',
        location: userData.location || '',
        created_at: new Date().toISOString()
      };

      // Add user to users array
      users.push(newUser);
      setToStorage('users', JSON.stringify(users));

      // Don't store the password in the current user
      const { password: _, ...userWithoutPassword } = newUser;

      // Store the current user in localStorage
      setToStorage('currentUser', JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
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
      }
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Generate a reset token
  generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  // Request password reset
  async resetPassword(email) {
    try {
      const users = JSON.parse(getFromStorage('users'));
      const userIndex = users.findIndex(u => u.email === email);

      if (userIndex === -1) {
        return { success: false, error: 'Email not found' };
      }

      // Generate a reset token and expiration time (24 hours from now)
      const resetToken = this.generateResetToken();
      const resetTokenExpires = new Date();
      resetTokenExpires.setHours(resetTokenExpires.getHours() + 24);

      // Update the user with the reset token and expiration
      users[userIndex].resetToken = resetToken;
      users[userIndex].resetTokenExpires = resetTokenExpires.toISOString();
      setToStorage('users', JSON.stringify(users));

      // Create the reset link
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // Send the password reset email
      const emailResult = await emailService.sendPasswordResetEmail(email, resetLink);

      if (emailResult.success) {
        console.log(`Password reset email sent to ${email}`);

        // If using Ethereal for testing, provide the preview URL
        if (emailResult.previewURL) {
          console.log('Email preview URL:', emailResult.previewURL);
          return {
            success: true,
            message: 'Password reset instructions have been sent to your email. Please check your inbox.',
            previewURL: emailResult.previewURL
          };
        }

        return {
          success: true,
          message: 'Password reset instructions have been sent to your email. Please check your inbox.'
        };
      } else {
        console.error('Failed to send password reset email:', emailResult.error);
        return {
          success: false,
          error: 'Failed to send password reset email. Please try again later.'
        };
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Complete password reset
  async completePasswordReset(email, token, newPassword) {
    try {
      const users = JSON.parse(getFromStorage('users'));
      const userIndex = users.findIndex(u => u.email === email);

      if (userIndex === -1) {
        return { success: false, error: 'Email not found' };
      }

      const user = users[userIndex];

      // Verify the reset token
      if (!user.resetToken || user.resetToken !== token) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Check if the token has expired
      const tokenExpires = new Date(user.resetTokenExpires);
      const now = new Date();
      if (now > tokenExpires) {
        return { success: false, error: 'Reset token has expired. Please request a new password reset.' };
      }

      // Update the user's password and clear the reset token
      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpires = null;
      users[userIndex] = user;
      setToStorage('users', JSON.stringify(users));

      return { success: true };
    } catch (error) {
      console.error('Error completing password reset:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Update user profile
  async updateProfile(userId, userData) {
    try {
      const users = JSON.parse(getFromStorage('users'));
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      // Update user data
      users[userIndex] = { ...users[userIndex], ...userData };

      // Don't update password
      if (userData.password) {
        delete userData.password;
      }

      setToStorage('users', JSON.stringify(users));

      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        setToStorage('currentUser', JSON.stringify({ ...currentUser, ...userData }));
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};

export default authService;
